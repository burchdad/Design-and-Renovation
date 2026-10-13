'use strict';
const { createHmac } = require('node:crypto');
const SITE = 'haven';
const PREFIX = 'haven/inquiries/v1/';
const SAFE_RETRY_MS = 23 * 60 * 60 * 1000; // Stay within Resend's 24-hour key lifetime.
const LEASE_MS = 60 * 1000;

class StoreError extends Error { constructor(code = 'storage_unavailable') { super(code); this.code = code; } }
const normalizeStore = value => String(value || '').replace(/^store_/, '');

function storageConfig(env) {
  const storeId = normalizeStore(env.HAVEN_INQUIRY_BLOB_STORE_ID);
  const projectId = env.HAVEN_INQUIRY_VERCEL_PROJECT_ID;
  const retentionDays = Number(env.INQUIRY_RETENTION_DAYS);
  // Select and verify a dedicated site store BEFORE invoking the SDK. Never use
  // its ambient static-token fallback or accept a caller-supplied store/path.
  if (env.VERCEL !== '1' || env.INQUIRY_STORAGE_VERIFIED !== 'true' || env.INQUIRY_RETENTION_APPROVED !== 'true' || env.INQUIRY_RETENTION_ENFORCED !== 'true' ||
      !/^[a-zA-Z0-9]{8,80}$/.test(storeId) || normalizeStore(env.BLOB_STORE_ID) !== storeId ||
      !/^prj_[a-zA-Z0-9]+$/.test(projectId || '') || env.VERCEL_PROJECT_ID !== projectId ||
      !(typeof env.VERCEL_OIDC_TOKEN === 'string' && env.VERCEL_OIDC_TOKEN.trim()) || Object.hasOwn(env, 'BLOB_READ_WRITE_TOKEN') ||
      !['production', 'preview', 'development'].includes(env.VERCEL_ENV) || env.HAVEN_INQUIRY_ENVIRONMENT !== env.VERCEL_ENV ||
      !Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) throw new StoreError();
  return { storeId, projectId, retentionDays, environment: env.VERCEL_ENV };
}
function inquiryIdentity(data, salt) {
  // A logical UUID distinguishes legitimate new inquiries with identical details.
  // Client timestamps remain metadata; retrying the same logical ID is stable.
  const canonical = JSON.stringify(['haven-v1', data.submissionId, data.name, data.email, data.phone, data.zip, data.description, data.service, data.projectType, data.conversion_path]);
  return createHmac('sha256', salt).update(canonical).digest('hex');
}
function minimalInquiry(data) {
  const result = {};
  for (const key of ['name', 'email', 'phone', 'zip', 'description', 'service', 'projectType', 'conversion_path', 'timestamp', 'submissionId']) result[key] = data[key] || '';
  return result;
}
async function bounded(operation, milliseconds) {
  const controller = new AbortController(); let timer;
  try {
    return await Promise.race([operation(controller.signal), new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new StoreError()); }, milliseconds); })]);
  } finally { clearTimeout(timer); }
}

function createPrivateStore(env, sdk, { now = () => Date.now(), timeout = 3000 } = {}) {
  const config = storageConfig(env);
  // Lazy loading is intentional: disabled deployments do not need auth or SDK IO.
  const blob = sdk || require('@vercel/blob');
  let ownershipVerified = false;
  function scope() {
    const latest = storageConfig(env);
    if (latest.storeId !== config.storeId || latest.projectId !== config.projectId || latest.environment !== config.environment) throw new StoreError();
    return { access: 'private', storeId: config.storeId };
  }
  async function verifyOwnership() {
    const pathname = 'haven/ownership.json';
    await bounded(async abortSignal => {
      const result = await blob.get(pathname, { ...scope(), useCache: false, abortSignal });
      if (!result || result.statusCode !== 200 || !result.stream || result.blob?.pathname !== pathname || result.blob.size > 4096) throw new StoreError();
      const manifest = await new Response(result.stream).json();
      if (manifest.schema !== 1 || manifest.site !== SITE || manifest.access !== 'private' || manifest.purpose !== 'inquiry-intake' || normalizeStore(manifest.storeId) !== config.storeId || manifest.projectId !== config.projectId || manifest.environment !== config.environment || JSON.stringify(manifest.allowedSites) !== '["haven"]') throw new StoreError();
      ownershipVerified = true;
    }, timeout);
  }
  const pathFor = id => { if (!/^[a-f0-9]{64}$/.test(id)) throw new StoreError(); return `${PREFIX}${id}.json`; };
  async function read(id) {
    const pathname = pathFor(id);
    return bounded(async abortSignal => {
      const result = await blob.get(pathname, { ...scope(), useCache: false, abortSignal });
      if (result === null) return null;
      if (result.statusCode !== 200 || !result.stream || !result.blob?.etag || result.blob.pathname !== pathname || result.blob.size > 40000) throw new StoreError();
      const record = await new Response(result.stream).json();
      if (record.site !== SITE || record.id !== id || record.schema !== 1 || !['pending', 'sending', 'sent', 'needs_review'].includes(record.notification?.state) || !record.inquiry || !Number.isFinite(Date.parse(record.expiresAt))) throw new StoreError();
      return { record, etag: result.blob.etag };
    }, timeout);
  }
  async function write(record, etag) {
    if (!ownershipVerified) throw new StoreError();
    const pathname = pathFor(record.id);
    return bounded(async abortSignal => {
      const result = await blob.put(pathname, JSON.stringify(record), {
        ...scope(), abortSignal, contentType: 'application/json', addRandomSuffix: false,
        allowOverwrite: Boolean(etag), ...(etag ? { ifMatch: etag } : {}), cacheControlMaxAge: 60
      });
      if (!result?.etag || result.pathname !== pathname) throw new StoreError();
      return { record, etag: result.etag };
    }, timeout);
  }
  async function prepare(data, salt, makeEnvelope) {
    await verifyOwnership();
    const id = inquiryIdentity(data, salt);
    const existing = await read(id);
    if (existing) return existing;
    const time = now();
    const record = { schema: 1, site: SITE, id, createdAt: new Date(time).toISOString(), expiresAt: new Date(time + config.retentionDays * 86400000).toISOString(), inquiry: minimalInquiry(data), notification: { envelope: makeEnvelope(data, id), state: 'pending', firstAttemptAt: null, leaseUntil: null, providerId: null } };
    try { return await write(record); }
    catch (failure) {
      const winner = await read(id);
      if (!winner) throw new StoreError();
      return winner;
    }
  }
  async function claim(saved) {
    const record = saved.record, time = now();
    if (Date.parse(record.expiresAt) <= time) throw new StoreError('retention_expired');
    if (record.notification.state === 'sent') return { ...saved, alreadySent: true };
    if (record.notification.state === 'needs_review') throw new StoreError('manual_review_required');
    const firstAttempt = record.notification.firstAttemptAt === null ? null : Date.parse(record.notification.firstAttemptAt);
    if (firstAttempt !== null && (!Number.isFinite(firstAttempt) || time - firstAttempt >= SAFE_RETRY_MS)) {
      await write({ ...record, notification: { ...record.notification, state: 'needs_review', leaseUntil: null } }, saved.etag);
      throw new StoreError('manual_review_required');
    }
    if (record.notification.state === 'sending' && Date.parse(record.notification.leaseUntil) > time) throw new StoreError('already_processing');
    const updated = { ...record, notification: { ...record.notification, state: 'sending', firstAttemptAt: record.notification.firstAttemptAt || new Date(time).toISOString(), leaseUntil: new Date(time + LEASE_MS).toISOString() } };
    try { return await write(updated, saved.etag); }
    catch (failure) {
      if (blob.BlobPreconditionFailedError && failure instanceof blob.BlobPreconditionFailedError) throw new StoreError('already_processing');
      throw new StoreError();
    }
  }
  async function complete(claimed, providerId) {
    return write({ ...claimed.record, notification: { ...claimed.record.notification, state: 'sent', leaseUntil: null, providerId, sentAt: new Date(now()).toISOString() } }, claimed.etag);
  }
  async function pending(claimed) {
    // CAS prevents a failed/older invocation from erasing a newer sent state.
    return write({ ...claimed.record, notification: { ...claimed.record.notification, state: 'pending', leaseUntil: null } }, claimed.etag);
  }
  return { prepare, claim, complete, pending };
}
module.exports = { createPrivateStore, storageConfig, inquiryIdentity, StoreError };
