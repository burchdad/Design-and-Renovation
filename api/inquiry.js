'use strict';

const { InquiryError, readConfig, readBody, validate, rateLimit, sendInquiry, prepareNotification, escapeHtml } = require('../lib/inquiry');
const { randomUUID } = require('node:crypto');
const { createPrivateStore, StoreError } = require('../lib/inquiry-store');

function respond(req, res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (String(req.headers.accept || '').includes('application/json')) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(body));
  }
  if (status === 200) {
    res.statusCode = 303;
    res.setHeader('Location', '/#thanks');
    return res.end();
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
  return res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inquiry not confirmed | Haven</title><body style="max-width:40rem;margin:10vh auto;padding:24px;font:18px/1.7 Arial,sans-serif;"><h1>We couldn't confirm your inquiry.</h1><p>${escapeHtml(body.error)}</p><p>Use your browser's Back button to return to your details, or <a href="/#inquire">return to the form</a>.</p><p><a href="tel:+17707225815">Call 770-722-5815</a> or <a href="mailto:micah@designhavenbuild.com">email micah@designhavenbuild.com</a>.</p></body></html>`);
}

function confirmNative(req, res, data) {
  // No storage or email until this review form is submitted. The generated UUID
  // survives reload/retry of the confirmation POST without a JavaScript runtime.
  const fields = { ...data, submissionId: randomUUID(), timestamp: data.timestamp || new Date().toISOString() };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
  const hidden = Object.entries(fields).map(([key, value]) => `<input type="hidden" name="${key}" value="${escapeHtml(value)}">`).join('');
  return res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm your inquiry | Haven</title><body style="max-width:40rem;margin:8vh auto;padding:24px;font:18px/1.7 Arial,sans-serif;"><h1>Review your inquiry</h1><p>${escapeHtml(data.name)} · ${escapeHtml(data.email)}</p><p style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(data.description)}</p><form action="/api/inquiry" method="POST">${hidden}<button type="submit" style="padding:14px 24px;font:inherit">Confirm and submit inquiry</button></form><p>Your inquiry has not been sent yet. Use your browser's Back button to change your details.</p></body></html>`);
}

function createHandler({ env = process.env, fetchImpl = globalThis.fetch, rateTimeout = 2000, sendTimeout = 7000, blobSdk, now, storageTimeout = 3000 } = {}) {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return respond(req, res, 405, { ok: false, error: 'Method not allowed.' });
    }
    try {
      const config = readConfig(env);
      const origin = req.headers.origin;
      if (typeof origin !== 'string' || !config.origins.includes(origin) || req.headers['sec-fetch-site'] === 'cross-site') throw new InquiryError(403, 'origin', 'Please reload the form from the Haven website.');
      const data = validate(await readBody(req));
      if (!data.submissionId) {
        if (String(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded') && !String(req.headers.accept || '').includes('application/json')) return confirmNative(req, res, data);
        throw new InquiryError(400, 'submission_id', 'Please reload the form before submitting.');
      }
      const storage = createPrivateStore(env, blobSdk, { now, timeout: storageTimeout });
      await rateLimit(req, config, fetchImpl, rateTimeout);
      const saved = await storage.prepare(data, config.salt, (inquiry, id) => prepareNotification(inquiry, config, id));
      const claimed = await storage.claim(saved);
      if (!claimed.alreadySent) {
        let providerId;
        try {
          providerId = await sendInquiry(claimed.record.notification.envelope, config, fetchImpl, sendTimeout);
        } catch (failure) {
          try { await storage.pending(claimed); } catch { /* Sending lease remains durable; no PII logs. */ }
          throw failure;
        }
        // If status persistence is ambiguous, retain the durable sending lease.
        // A retry uses the same provider key; never overwrite it with pending.
        await storage.complete(claimed, providerId);
      }
      // Saved privately and accepted by the mail provider; not a claim of inbox delivery.
      return respond(req, res, 200, { ok: true });
    } catch (failure) {
      if (failure instanceof StoreError && failure.code === 'already_processing') failure = new InquiryError(409, 'already_processing', 'Your inquiry is being processed. Please wait a minute before retrying.');
      const known = failure instanceof InquiryError;
      if (failure.retryAfter) res.setHeader('Retry-After', String(failure.retryAfter));
      // Do not log request data, email bodies, credentials or raw provider responses.
      return respond(req, res, known ? failure.status : 503, {
        ok: false,
        code: known ? failure.code : 'unavailable',
        error: known ? failure.message : 'The form is temporarily unavailable. Please contact us directly.'
      });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
