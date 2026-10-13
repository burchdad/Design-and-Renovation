'use strict';

const { createHmac } = require('node:crypto');
const { isIP } = require('node:net');
const MAX_BODY_BYTES = 16 * 1024;
const SERVICES = ['', 'Kitchen Remodel', 'Bathroom Renovation', 'Basement Finishing', 'Garage Spaces', 'Deck or Outdoor Living', 'Commercial Project', 'Other'];
const PROJECT_TYPES = ['Residential', 'Commercial', 'Not sure yet'];
const FIELDS = ['name', 'email', 'phone', 'zip', 'description', 'service', 'projectType', 'conversion_path', 'website', 'timestamp', 'submissionId'];
const EMAIL = /^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

class InquiryError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const error = (status, code, message) => new InquiryError(status, code, message);
const unavailable = () => error(503, 'unavailable', 'The form is temporarily unavailable. Please use the phone or email link below.');
const invalid = () => error(400, 'invalid_fields', 'Please check your contact details and project description.');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const digest = (value, salt) => createHmac('sha256', salt).update(value).digest('hex');

function readConfig(env) {
  const gates = ['INQUIRY_RESEND_ENABLED', 'INQUIRY_SENDER_VERIFIED', 'INQUIRY_RECIPIENT_CONFIRMED', 'INQUIRY_APPROVED_TEST_PASSED'];
  if (gates.some((key) => env[key] !== 'true') || env.VERCEL !== '1') throw unavailable();
  const from = env.INQUIRY_FROM_EMAIL || '';
  const to = env.INQUIRY_TO_EMAIL || '';
  const salt = env.INQUIRY_RATE_LIMIT_SALT || '';
  if (!EMAIL.test(from) || !EMAIL.test(to) || from.length > 254 || to.length > 254 || !env.RESEND_API_KEY || !env.INQUIRY_RATE_LIMIT_TOKEN || salt.length < 32) throw unavailable();
  let rateUrl, origins;
  try {
    rateUrl = new URL(env.INQUIRY_RATE_LIMIT_URL);
    if (rateUrl.protocol !== 'https:' || !/^[a-z0-9-]+\.upstash\.io$/.test(rateUrl.hostname) || rateUrl.username || rateUrl.password || rateUrl.port || rateUrl.pathname !== '/' || rateUrl.search || rateUrl.hash) throw unavailable();
    origins = (env.INQUIRY_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim());
    if (!origins.length || origins.some((origin) => { const url = new URL(origin); return url.origin !== origin || url.protocol !== 'https:'; })) throw unavailable();
  } catch { throw unavailable(); }
  return { from, to, salt, origins, rateUrl: rateUrl.origin, rateToken: env.INQUIRY_RATE_LIMIT_TOKEN, apiKey: env.RESEND_API_KEY };
}

async function readBody(req) {
  const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(type)) throw error(415, 'content_type', 'Unsupported form format. Please reload the page.');
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) throw error(413, 'too_large', 'Your project description is too long. Please shorten it.');
  let raw = req.body;
  if (raw === undefined) {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.length;
      if (size > MAX_BODY_BYTES) throw error(413, 'too_large', 'Your project description is too long. Please shorten it.');
      chunks.push(bytes);
    }
    raw = Buffer.concat(chunks);
  }
  if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
  if (Buffer.byteLength(typeof raw === 'string' ? raw : JSON.stringify(raw) || '') > MAX_BODY_BYTES) throw error(413, 'too_large', 'Your project description is too long. Please shorten it.');
  try {
    if (typeof raw === 'string') {
      if (type === 'application/json') raw = JSON.parse(raw);
      else {
        const entries = [...new URLSearchParams(raw)];
        if (new Set(entries.map(([key]) => key)).size !== entries.length) throw invalid();
        raw = Object.fromEntries(entries);
      }
    }
  } catch { throw invalid(); }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw invalid();
  return raw;
}

function validate(body) {
  // Native cutover keeps the two legacy hidden fields until reviewed cleanup.
  // Accept only their known values, discard them, and never use them for routing.
  body = { ...body };
  for (const [key, expected] of [['_subject', 'New Haven Design & Build inquiry'], ['_next', 'https://www.designhavenbuild.com/#thanks']]) {
    if (Object.hasOwn(body, key)) { if (body[key] !== expected) throw invalid(); delete body[key]; }
  }
  if (Object.keys(body).some((key) => !FIELDS.includes(key)) || Object.values(body).some((value) => typeof value !== 'string')) throw invalid();
  const limits = { name: 120, email: 254, phone: 40, zip: 10, description: 5000, service: 80, projectType: 30, conversion_path: 80, website: 200, timestamp: 32, submissionId: 36 };
  const result = {};
  for (const field of FIELDS) {
    const value = (body[field] || '').trim();
    // Allow newlines only in project details. Never permit header/control injection.
    if (value.length > limits[field] || (field === 'description' ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ : /[\x00-\x1F\x7F]/).test(value)) throw invalid();
    result[field] = value;
  }
  if (result.website) throw error(400, 'invalid_fields', 'Unable to submit this form. Please use the phone or email link below.');
  if (!result.name || !EMAIL.test(result.email) || !result.description || !/^[\d\s()+.\-]+$/.test(result.phone) || result.phone.replace(/\D/g, '').length < 10 || result.phone.replace(/\D/g, '').length > 15 || !/^\d{5}(?:-\d{4})?$/.test(result.zip) || !SERVICES.includes(result.service) || !PROJECT_TYPES.includes(result.projectType) || result.conversion_path !== 'homepage_project_fit_review') throw invalid();
  if (result.submissionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.submissionId)) throw invalid();
  if (result.timestamp && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result.timestamp) || !Number.isFinite(Date.parse(result.timestamp)))) throw invalid();
  result.description = result.description.replace(/\r\n?/g, '\n');
  return result;
}

async function timedJson(fetchImpl, url, init, milliseconds) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchImpl(url, { ...init, redirect: 'error', signal: controller.signal });
        const data = await response.json();
        return { response, data };
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(error(504, 'delivery_unconfirmed', 'We could not confirm your submission. Please retry with the same details or contact us directly.')); }, milliseconds);
      })
    ]);
  } finally { clearTimeout(timer); }
}

// Atomic shared counters, not per-instance memory. HMAC protects IPs stored in Redis.
const RATE_SCRIPT = `local ip = tonumber(redis.call('GET', KEYS[1]) or '0')
local total = tonumber(redis.call('GET', KEYS[2]) or '0')
if ip >= 5 then return {0, math.max(1, redis.call('TTL', KEYS[1]))} end
if total >= 60 then return {0, math.max(1, redis.call('TTL', KEYS[2]))} end
ip = redis.call('INCR', KEYS[1])
if ip == 1 then redis.call('EXPIRE', KEYS[1], 600) end
total = redis.call('INCR', KEYS[2])
if total == 1 then redis.call('EXPIRE', KEYS[2], 3600) end
return {1, 0}`;

async function rateLimit(req, config, fetchImpl, timeout = 2000) {
  const ip = req.headers['x-vercel-forwarded-for'];
  if (typeof ip !== 'string' || !isIP(ip)) throw unavailable();
  const keys = [`haven:inquiry:ip:${digest(ip, config.salt)}`, 'haven:inquiry:global'];
  let result;
  try {
    const { response, data } = await timedJson(fetchImpl, config.rateUrl, {
      method: 'POST', headers: { Authorization: `Bearer ${config.rateToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', RATE_SCRIPT, '2', ...keys])
    }, timeout);
    if (!response.ok || data.error || !Array.isArray(data.result)) throw unavailable();
    result = data.result;
  } catch { throw unavailable(); }
  if (result[0] === 0 && Number.isInteger(result[1]) && result[1] > 0) {
    const failure = error(429, 'rate_limited', 'Please wait before trying again, or contact us directly.');
    failure.retryAfter = Math.min(result[1], 3600);
    throw failure;
  }
  if (result[0] !== 1) throw unavailable();
}

function renderNotification(data, submissionId = 'PREVIEW-ONLY') {
  const details = [['Name', data.name], ['Email', data.email], ['Service interest', data.service || 'Not specified'], ['Project type', data.projectType]];
  const rows = details.map(([label, value]) => `<tr><td style="padding:14px 0;border-bottom:1px solid #e8e1d7;vertical-align:top;width:36%;font-size:13px;color:#78654e;">${label}</td><td style="padding:14px 0 14px 16px;border-bottom:1px solid #e8e1d7;vertical-align:top;font-size:16px;line-height:1.5;word-break:break-word;">${escapeHtml(value)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Haven project inquiry</title></head><body style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#25221f;"><div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;overflow:hidden;">New project details for Haven Design &amp; Build.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1eb;"><tr><td align="center" style="padding:36px 16px;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;"><tr><td style="padding:36px 32px;background:#171716;border-top:4px solid #b99061;"><p style="margin:0 0 20px;font-size:12px;letter-spacing:3px;color:#d9bc92;">HAVEN DESIGN &amp; BUILD</p><h1 style="margin:0;font-family:Georgia,serif;font-size:32px;line-height:1.2;font-weight:normal;color:#fff;">A new project to consider.</h1><p style="margin:18px 0 0;font-size:16px;line-height:1.6;color:#ded6cb;">Website inquiry · Project fit review</p></td></tr><tr><td style="padding:28px 32px 32px;"><h2 style="margin:0 0 8px;font-size:12px;letter-spacing:2px;color:#78654e;">CONTACT &amp; PROJECT</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table><h2 style="margin:32px 0 14px;font-size:12px;letter-spacing:2px;color:#78654e;">SAVED INQUIRY</h2><div style="padding:22px;background:#f7f4ef;border-left:3px solid #b99061;font-size:16px;line-height:1.75;word-break:break-word;">The complete project details are saved in Haven’s private intake store.<br><br><span style="font-size:12px;color:#78654e;">REFERENCE</span><br><span style="font-size:12px;word-break:break-all;">${escapeHtml(submissionId)}</span></div><p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#62584e;">Reply to this email to reach the person who submitted the inquiry. Contact details and project description are visitor-provided.</p></td></tr><tr><td style="padding:22px 32px;background:#eee8df;font-size:12px;line-height:1.6;color:#78654e;">HAVEN DESIGN &amp; BUILD LLC<br>Source: website · homepage_project_fit_review</td></tr></table></td></tr></table></body></html>`;
  const text = ['HAVEN DESIGN & BUILD', 'New project inquiry', '', ...details.map(([label, value]) => `${label}: ${value}`), '', 'Full project details are saved in Haven’s private intake store.', `Inquiry reference: ${submissionId}`, '', 'Source: website / homepage_project_fit_review', 'Reply to this email to reach the visitor. Visitor-provided details.'].join('\n');
  return { html, text };
}

function prepareNotification(data, config, submissionId) {
  const { html, text } = renderNotification(data, submissionId);
  const payload = JSON.stringify({ from: `Haven Design & Build <${config.from}>`, to: [config.to], reply_to: data.email, subject: `New Haven inquiry - ${data.service || 'Project details'}`, html, text });
  return { payload, idempotencyKey: `haven-inquiry-v1/${submissionId}`, from: config.from, to: config.to };
}

async function sendInquiry(envelope, config, fetchImpl, timeout = 7000) {
  // Freeze bytes and key in the outbox. Changed routing requires reconciliation,
  // not a send to either a previous or a newly configured recipient.
  if (!envelope || envelope.from !== config.from || envelope.to !== config.to || typeof envelope.payload !== 'string' || typeof envelope.idempotencyKey !== 'string') throw unavailable();
  try {
    const { response, data: result } = await timedJson(fetchImpl, 'https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': envelope.idempotencyKey }, body: envelope.payload
    }, timeout);
    if (!response.ok || typeof result.id !== 'string' || !result.id.trim()) throw error(502, 'delivery_unconfirmed', 'We could not confirm your submission. Please retry with the same details or contact us directly.');
    return result.id;
  } catch (failure) {
    if (failure instanceof InquiryError) throw failure;
    throw error(502, 'delivery_unconfirmed', 'We could not confirm your submission. Please retry with the same details or contact us directly.');
  }
}

module.exports = { InquiryError, readConfig, readBody, validate, rateLimit, renderNotification, prepareNotification, sendInquiry, escapeHtml, SERVICES, PROJECT_TYPES, MAX_BODY_BYTES };
