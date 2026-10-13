'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const { createHandler } = require('../api/inquiry');
const { renderNotification, validate, SERVICES, PROJECT_TYPES } = require('../lib/inquiry');
const { fakeBlob, storageEnv } = require('./blob-fixture');
const env = {
  ...storageEnv,
  VERCEL: '1', INQUIRY_RESEND_ENABLED: 'true', INQUIRY_SENDER_VERIFIED: 'true', INQUIRY_RECIPIENT_CONFIRMED: 'true', INQUIRY_APPROVED_TEST_PASSED: 'true', INQUIRY_ARCHIVE_REVIEWED: 'true',
  RESEND_API_KEY: 'offline-resend-placeholder', INQUIRY_FROM_EMAIL: 'forms@example.test', INQUIRY_TO_EMAIL: 'review@example.test',
  INQUIRY_ALLOWED_ORIGINS: 'https://www.designhavenbuild.com', INQUIRY_RATE_LIMIT_URL: 'https://offline-test.upstash.io', INQUIRY_RATE_LIMIT_TOKEN: 'offline-rate-placeholder', INQUIRY_RATE_LIMIT_SALT: 'offline-only-salt-that-is-more-than-thirty-two-characters'
};
const valid = { submissionId: '04bf170a-685c-49b1-bb17-7cbd95139b5f', name: 'Alex Example', email: 'alex@example.test', phone: '770-555-0100', zip: '30060', description: 'Kitchen layout and cabinetry.\nA larger island would help.', service: 'Kitchen Remodel', projectType: 'Residential', conversion_path: 'homepage_project_fit_review', website: '', timestamp: '2026-10-13T19:00:00.000Z' };
function fakeResponse(status, data) { return { ok: status >= 200 && status < 300, status, json: async () => data }; }
async function run({ body = valid, headers = {}, method = 'POST', config = env, responses, fetchImpl, rateTimeout, sendTimeout, stream, blobSdk = fakeBlob(), now, storageTimeout } = {}) {
  const calls = [];
  const queue = responses || [fakeResponse(200, { result: [1, 0] }), fakeResponse(200, { id: 'offline-message-id' })];
  const mockFetch = async (...args) => { calls.push(args); if (fetchImpl) return fetchImpl(...args); assert.ok(queue.length, 'unexpected network request'); return queue.shift(); };
  const req = stream || { body };
  Object.assign(req, { method, headers: { origin: env.INQUIRY_ALLOWED_ORIGINS, 'x-vercel-forwarded-for': '192.0.2.20', accept: 'application/json', 'content-type': 'application/json', ...headers } });
  const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = value; } };
  await createHandler({ env: config, fetchImpl: mockFetch, rateTimeout, sendTimeout, blobSdk, now, storageTimeout })(req, res);
  return { res, calls, blobSdk, json: res.headers['Content-Type']?.startsWith('application/json') ? JSON.parse(res.body) : null };
}

test('valid submission sends one safe multipart notification using only configured routing', async () => {
  const { res, calls, json } = await run();
  assert.equal(res.statusCode, 200); assert.deepEqual(json, { ok: true }); assert.equal(calls.length, 2);
  assert.equal(calls[1][0], 'https://api.resend.com/emails');
  const payload = JSON.parse(calls[1][1].body);
  assert.equal(payload.from, 'Haven Design & Build <forms@example.test>'); assert.deepEqual(payload.to, ['review@example.test']); assert.equal(payload.reply_to, valid.email);
  assert.match(payload.html, /A new project to consider/); assert.match(payload.text, /private intake store/); assert.ok(!payload.text.includes(valid.description)); assert.ok(!payload.text.includes(valid.phone));
  assert.equal(res.headers['Cache-Control'], 'no-store'); assert.ok(!res.body.includes('offline-'));
  assert.equal(calls[1][1].redirect, 'error');
});

test('minimal HTML safely escapes visitor names; sensitive project detail stays only in the private record', () => {
  const data = validate({ ...valid, name: '<img src=x onerror=alert(1)>', description: 'Private project details' });
  const { html, text } = renderNotification(data, 'offline-reference');
  assert.ok(!html.includes('<img src=x')); assert.match(html, /&lt;img/); assert.ok(!html.includes(data.description)); assert.ok(!text.includes(data.phone)); assert.match(text, /offline-reference/);
});

for (const field of ['INQUIRY_RESEND_ENABLED', 'INQUIRY_SENDER_VERIFIED', 'INQUIRY_RECIPIENT_CONFIRMED', 'INQUIRY_APPROVED_TEST_PASSED', 'INQUIRY_FROM_EMAIL', 'INQUIRY_TO_EMAIL', 'RESEND_API_KEY', 'INQUIRY_RATE_LIMIT_URL', 'INQUIRY_RATE_LIMIT_TOKEN', 'INQUIRY_RATE_LIMIT_SALT', 'INQUIRY_ALLOWED_ORIGINS', 'VERCEL']) {
  test(`missing ${field} fails closed without a network call`, async () => { const { res, calls } = await run({ config: { ...env, [field]: '' } }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); });
}
for (const [field, value] of [['INQUIRY_FROM_EMAIL', 'bad@example.test\r\nBcc: hidden@example.test'], ['INQUIRY_TO_EMAIL', 'one@example.test,two@example.test'], ['INQUIRY_RATE_LIMIT_URL', 'http://offline-test.upstash.io'], ['INQUIRY_RATE_LIMIT_URL', 'https://evil.test'], ['INQUIRY_ALLOWED_ORIGINS', 'https://www.designhavenbuild.com/path']]) {
  test(`invalid configuration is rejected: ${field} ${value.slice(0,20)}`, async () => { const { res, calls } = await run({ config: { ...env, [field]: value } }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); });
}
for (const headers of [{ origin: 'https://evil.test' }, { origin: undefined }, { 'sec-fetch-site': 'cross-site' }]) {
  test(`rejects unsafe origin ${JSON.stringify(headers)}`, async () => { const { res, calls } = await run({ headers }); assert.equal(res.statusCode, 403); assert.equal(calls.length, 0); });
}
for (const [key, value] of [['email', 'invalid'], ['email', 'a@example.test\r\nBcc: b@example.test'], ['name', ''], ['name', 'A'.repeat(121)], ['phone', '----------'], ['phone', '123'], ['zip', 'abc'], ['description', ''], ['description', 'x'.repeat(5001)], ['service', 'Attacker subject'], ['projectType', 'other'], ['conversion_path', 'other'], ['website', 'https://spam.test'], ['description', { nested: true }], ['timestamp', 'yesterday']]) {
  test(`invalid ${key} is rejected before network`, async () => { const { res, calls } = await run({ body: { ...valid, [key]: value } }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); });
}
for (const field of ['to', 'from', 'reply_to', '_subject', '__proto__']) {
  test(`unrecognized field ${field} cannot override routing`, async () => { const { res, calls } = await run({ body: { ...valid, [field]: 'attacker@example.test' } }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); });
}
test('every existing service and project option validates, including optional service', () => { for (const service of SERVICES) for (const projectType of PROJECT_TYPES) assert.equal(validate({ ...valid, service, projectType }).service, service); });
test('method guard', async () => { const { res, calls } = await run({ method: 'GET' }); assert.equal(res.statusCode, 405); assert.equal(res.headers.Allow, 'POST'); assert.equal(calls.length, 0); });
test('unsupported content type', async () => { const { res, calls } = await run({ headers: { 'content-type': 'multipart/form-data' } }); assert.equal(res.statusCode, 415); assert.equal(calls.length, 0); });
test('malformed JSON fails without sending', async () => { const { res, calls } = await run({ body: '{broken' }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); });
test('JSON array fails without sending', async () => { const { res, calls } = await run({ body: [] }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); });
test('oversized body is rejected', async () => { const { res, calls } = await run({ body: 'x'.repeat(17000) }); assert.equal(res.statusCode, 413); assert.equal(calls.length, 0); });
test('oversized content length is rejected', async () => { const { res } = await run({ headers: { 'content-length': '20000' } }); assert.equal(res.statusCode, 413); });
test('streaming body limit is enforced', async () => { const { res, calls } = await run({ stream: Readable.from([Buffer.alloc(9000), Buffer.alloc(9000)]) }); assert.equal(res.statusCode, 413); assert.equal(calls.length, 0); });
test('streaming JSON is supported', async () => { const { res } = await run({ stream: Readable.from([JSON.stringify(valid)]) }); assert.equal(res.statusCode, 200); });
test('native form fallback redirects only after accepted mail', async () => { const { res } = await run({ body: new URLSearchParams(valid).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' } }); assert.equal(res.statusCode, 303); assert.equal(res.headers.Location, '/#thanks'); });
test('duplicate native field is rejected', async () => { const { res, calls } = await run({ body: `${new URLSearchParams(valid)}&email=attacker@example.test`, headers: { 'content-type': 'application/x-www-form-urlencoded' } }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); });
test('native errors offer safe existing contact links and no false success', async () => { const { res } = await run({ body: { ...valid, email: 'invalid' }, headers: { accept: 'text/html' } }); assert.equal(res.statusCode, 400); assert.match(res.body, /couldn't confirm/); assert.match(res.body, /mailto:micah@designhavenbuild.com/); });
for (const ip of ['', '192.0.2.1, 192.0.2.2', 'untrusted']) {
  test(`missing or ambiguous trusted IP fails closed: ${ip}`, async () => { const { res, calls } = await run({ headers: { 'x-vercel-forwarded-for': ip } }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); });
}
test('rate counters contain HMAC only, no raw IP or lead data', async () => { const { calls } = await run(); const body = JSON.parse(calls[0][1].body); assert.equal(body[0], 'EVAL'); assert.equal(body[2], '2'); assert.match(body[3], /^haven:inquiry:ip:[a-f0-9]{64}$/); assert.ok(!calls[0][1].body.includes('192.0.2.20')); assert.ok(!calls[0][1].body.includes(valid.email)); });
test('shared rate limit blocks mail and sets Retry-After', async () => { const { res, calls } = await run({ responses: [fakeResponse(200, { result: [0, 120] })] }); assert.equal(res.statusCode, 429); assert.equal(res.headers['Retry-After'], '120'); assert.equal(calls.length, 1); });
for (const response of [fakeResponse(503, {}), fakeResponse(200, { error: 'offline-redis-secret-error' }), fakeResponse(200, { result: ['1', 0] })]) {
  test('rate-limit dependency failure never bypasses the gate', async () => { const { res, calls } = await run({ responses: [response] }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); assert.ok(!res.body.includes('redis-secret')); });
}
test('rate timeout fails closed', async () => { const { res, calls } = await run({ fetchImpl: async () => new Promise(() => {}), rateTimeout: 5 }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); });
for (const response of [fakeResponse(401, { message: 'offline-resend-secret-error' }), fakeResponse(429, {}), fakeResponse(500, {}), fakeResponse(200, {}), fakeResponse(200, { id: '' }), { ok: true, json: async () => { throw new Error('broken JSON'); } }]) {
  test('provider failure cannot return success or expose details', async () => { const { res } = await run({ responses: [fakeResponse(200, { result: [1, 0] }), response] }); assert.equal(res.statusCode, 502); assert.ok(!res.body.includes('secret')); });
}
test('provider timeout aborts and returns delivery unconfirmed', async () => { let count = 0, signal; const { res } = await run({ sendTimeout: 5, fetchImpl: async (_url, init) => { if (++count === 1) return fakeResponse(200, { result: [1, 0] }); signal = init.signal; return new Promise(() => {}); } }); assert.equal(res.statusCode, 504); assert.equal(signal.aborted, true); });
test('network exception is sanitized', async () => { let count = 0; const { res } = await run({ fetchImpl: async () => { if (++count === 1) return fakeResponse(200, { result: [1, 0] }); throw new Error('offline-api-secret'); } }); assert.equal(res.statusCode, 502); assert.ok(!res.body.includes('offline-api-secret')); });
test('same-payload retry has stable idempotency, edited payload gets a new key', async () => { const a = await run(); const b = await run(); const c = await run({ body: { ...valid, description: 'Changed scope' } }); const key = (r) => r.calls[1][1].headers['Idempotency-Key']; assert.equal(key(a), key(b)); assert.notEqual(key(a), key(c)); });

module.exports = { run, valid, env, fakeResponse };

for (const field of ['INQUIRY_STORAGE_VERIFIED', 'INQUIRY_RETENTION_APPROVED', 'INQUIRY_RETENTION_ENFORCED', 'INQUIRY_RETENTION_DAYS', 'HAVEN_INQUIRY_BLOB_STORE_ID', 'BLOB_STORE_ID', 'HAVEN_INQUIRY_VERCEL_PROJECT_ID', 'VERCEL_PROJECT_ID', 'VERCEL_OIDC_TOKEN']) {
  test(`missing storage boundary ${field} prevents storage and mail`, async () => {
    const config = { ...env }; delete config[field]; const blobSdk = fakeBlob();
    const { res, calls } = await run({ config, blobSdk });
    assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); assert.equal(blobSdk.calls.length, 0);
  });
}
for (const changed of [{ BLOB_STORE_ID: 'store_othersite1234' }, { VERCEL_PROJECT_ID: 'prj_othersite' }, { BLOB_READ_WRITE_TOKEN: 'offline-static-token-forbidden' }, { INQUIRY_RETENTION_DAYS: '0' }, { INQUIRY_RETENTION_DAYS: '1.5' }]) {
  test(`unsafe storage config rejected before SDK IO: ${Object.keys(changed)[0]}`, async () => { const blobSdk = fakeBlob(); const { res, calls } = await run({ config: { ...env, ...changed }, blobSdk }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); assert.equal(blobSdk.calls.length, 0); });
}
test('private save precedes notification; all storage calls are explicitly site scoped', async () => {
  const blobSdk = fakeBlob(); let requests = 0;
  const { res } = await run({ blobSdk, fetchImpl: async () => { if (++requests === 1) return fakeResponse(200, { result: [1, 0] }); const records = [...blobSdk.records.values()].map(x => JSON.parse(x.body)); assert.equal(records.length, 1); assert.equal(records[0].notification.state, 'sending'); assert.equal(records[0].inquiry.description, valid.description); return fakeResponse(200, { id: 'offline-id' }); } });
  assert.equal(res.statusCode, 200);
  const record = JSON.parse([...blobSdk.records.values()][0].body);
  assert.equal(record.notification.state, 'sent'); assert.equal(record.notification.providerId, 'offline-id'); assert.equal(record.inquiry.website, undefined); assert.equal(record.ip, undefined);
  for (const call of blobSdk.calls) { assert.equal(call.options.storeId, 'havenoffline1234'); assert.equal(call.options.access, 'private'); assert.ok(call.pathname.startsWith('haven/inquiries/v1/') || call.pathname === 'haven/ownership.json'); assert.equal(call.options.token, undefined); assert.equal(call.options.oidcToken, undefined); }
  const updates = blobSdk.calls.filter(x => x.method === 'put' && x.options.allowOverwrite);
  assert.equal(updates.length, 2); assert.ok(updates.every(x => x.options.ifMatch));
});
test('storage failure prevents sending any email', async () => { const blobSdk = fakeBlob(); blobSdk.put = async () => { throw new Error('storage down'); }; const { res, calls } = await run({ blobSdk }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); assert.equal(blobSdk.records.size, 0); });
test('storage read failure prevents notification', async () => { const blobSdk = fakeBlob(); blobSdk.get = async () => { throw new Error('private read failed'); }; const { res, calls } = await run({ blobSdk }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); });
test('storage timeout prevents notification', async () => { const blobSdk = fakeBlob(); blobSdk.get = async () => new Promise(() => {}); const { res, calls } = await run({ blobSdk, storageTimeout: 5 }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); });
test('provider failure preserves a pending private inquiry with its full details', async () => { const blobSdk = fakeBlob(); const { res } = await run({ blobSdk, responses: [fakeResponse(200, { result: [1, 0] }), fakeResponse(500, {})] }); assert.equal(res.statusCode, 502); const record = JSON.parse([...blobSdk.records.values()][0].body); assert.equal(record.notification.state, 'pending'); assert.equal(record.inquiry.description, valid.description); assert.equal(record.notification.providerId, null); assert.ok(record.notification.firstAttemptAt); });
test('retry sends saved inquiry once, then sent duplicate is acknowledged without mail', async () => {
  const blobSdk = fakeBlob();
  const failed = await run({ blobSdk, responses: [fakeResponse(200, { result: [1, 0] }), fakeResponse(500, {})] });
  const retry = await run({ blobSdk, body: { ...valid, timestamp: '2026-10-13T20:00:00.000Z' } });
  const duplicate = await run({ blobSdk });
  assert.equal(retry.res.statusCode, 200); assert.equal(duplicate.res.statusCode, 200); assert.equal(duplicate.calls.length, 1); assert.equal(blobSdk.records.size, 1);
  assert.equal(failed.calls[1][1].headers['Idempotency-Key'], retry.calls[1][1].headers['Idempotency-Key']); assert.equal(failed.calls[1][1].body, retry.calls[1][1].body);
});
test('concurrent submissions share a record and one conditional send lease', async () => {
  const blobSdk = fakeBlob(); let release, started;
  const seen = new Promise(resolve => { started = resolve; });
  const first = run({ blobSdk, fetchImpl: async (url) => { if (url.includes('upstash')) return fakeResponse(200, { result: [1, 0] }); started(); return new Promise(resolve => { release = () => resolve(fakeResponse(200, { id: 'offline-concurrent' })); }); } });
  await seen;
  const second = await run({ blobSdk }); assert.equal(second.res.statusCode, 409); assert.equal(second.calls.length, 1); release();
  assert.equal((await first).res.statusCode, 200); assert.equal(blobSdk.records.size, 1);
});
test('failed sent-state write retains sending record and retry stays idempotent', async () => {
  const blobSdk = fakeBlob(); const put = blobSdk.put.bind(blobSdk); let rejectSent = true, time = Date.parse('2026-10-13T19:00:00.000Z');
  blobSdk.put = async (path, body, options) => { if (rejectSent && JSON.parse(body).notification.state === 'sent') throw new Error('status write failed'); return put(path, body, options); };
  const first = await run({ blobSdk, now: () => time }); assert.equal(first.res.statusCode, 503);
  assert.equal(JSON.parse([...blobSdk.records.values()][0].body).notification.state, 'sending');
  const busy = await run({ blobSdk, now: () => time }); assert.equal(busy.res.statusCode, 409); assert.equal(busy.calls.length, 1);
  time += 61000; rejectSent = false;
  const retry = await run({ blobSdk, now: () => time }); assert.equal(retry.res.statusCode, 200);
  assert.equal(first.calls[1][1].headers['Idempotency-Key'], retry.calls[1][1].headers['Idempotency-Key']);
});
test('ambiguous delivery older than dedupe window requires review, never blind resend', async () => {
  const blobSdk = fakeBlob(); let time = Date.parse('2026-10-13T19:00:00.000Z');
  await run({ blobSdk, now: () => time, responses: [fakeResponse(200, { result: [1, 0] }), fakeResponse(500, {})] });
  time += 24 * 3600000;
  const retry = await run({ blobSdk, now: () => time }); assert.equal(retry.res.statusCode, 503); assert.equal(retry.calls.length, 1);
  assert.equal(JSON.parse([...blobSdk.records.values()][0].body).notification.state, 'needs_review');
});
test('unexpired records require configured retention; expired records are not silently re-used', async () => {
  const blobSdk = fakeBlob(); let time = Date.parse('2026-10-13T19:00:00.000Z');
  await run({ blobSdk, now: () => time, config: { ...env, INQUIRY_RETENTION_DAYS: '1' } });
  const record = JSON.parse([...blobSdk.records.values()][0].body); assert.equal(Date.parse(record.expiresAt) - time, 86400000);
  time += 86400001; const retry = await run({ blobSdk, now: () => time, config: { ...env, INQUIRY_RETENTION_DAYS: '1' } }); assert.equal(retry.res.statusCode, 503); assert.equal(retry.calls.length, 1);
});
test('simultaneous first submissions cannot overwrite the new record or send twice', async () => {
  const blobSdk = fakeBlob();
  const results = await Promise.all([run({ blobSdk }), run({ blobSdk })]);
  assert.equal(blobSdk.records.size, 1);
  assert.equal(results.flatMap(result => result.calls).filter(call => call[0] === 'https://api.resend.com/emails').length, 1);
  assert.ok(results.some(result => result.res.statusCode === 200));
  assert.ok(results.every(result => [200, 409].includes(result.res.statusCode)));
});
test('failed pending-state update still retains recoverable sending record', async () => {
  const blobSdk = fakeBlob(); const put = blobSdk.put.bind(blobSdk);
  blobSdk.put = async (pathname, body, options) => { if (options.allowOverwrite && JSON.parse(body).notification.state === 'pending') throw new Error('state write failed'); return put(pathname, body, options); };
  const { res } = await run({ blobSdk, responses: [fakeResponse(200, { result: [1, 0] }), fakeResponse(500, {})] });
  assert.equal(res.statusCode, 502); const record = JSON.parse([...blobSdk.records.values()][0].body); assert.equal(record.notification.state, 'sending'); assert.equal(record.inquiry.description, valid.description); assert.ok(record.notification.leaseUntil);
});
test('stale conditional pending update cannot erase a sent record', async () => {
  const blobSdk = fakeBlob(); const { createPrivateStore } = require('../lib/inquiry-store'); const storage = createPrivateStore(env, blobSdk);
  const saved = await storage.prepare(validate(valid), env.INQUIRY_RATE_LIMIT_SALT, (data, id) => require('../lib/inquiry').prepareNotification(data, require('../lib/inquiry').readConfig(env), id)); const claimed = await storage.claim(saved);
  await storage.complete(claimed, 'offline-message'); await assert.rejects(storage.pending(claimed));
  assert.equal(JSON.parse([...blobSdk.records.values()][0].body).notification.state, 'sent');
});
for (const changed of [{ VERCEL_OIDC_TOKEN: '' }, { VERCEL_OIDC_TOKEN: '   ' }, { VERCEL_ENV: 'production' }, { HAVEN_INQUIRY_ENVIRONMENT: '' }]) {
  test(`OIDC/environment boundary blocks before IO: ${Object.keys(changed)[0]}`, async () => { const blobSdk = fakeBlob(); const { res, calls } = await run({ blobSdk, config: { ...env, ...changed } }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 0); assert.equal(blobSdk.calls.length, 0); });
}
for (const manifest of [null, { schema: 1, site: 'another-site' }, { schema: 1, site: 'haven', access: 'private', purpose: 'inquiry-intake', storeId: 'havenoffline1234', projectId: 'prj_havenoffline', environment: 'production', allowedSites: ['haven'] }, { schema: 1, site: 'haven', access: 'private', purpose: 'inquiry-intake', storeId: 'havenoffline1234', projectId: 'prj_havenoffline', environment: 'preview', allowedSites: ['haven', 'other'] }]) {
  test('missing or mismatched ownership manifest prevents all writes and mail', async () => {
    const blobSdk = fakeBlob(), get = blobSdk.get.bind(blobSdk);
    blobSdk.get = async (pathname, options) => pathname === 'haven/ownership.json' ? (manifest && { statusCode: 200, stream: new Response(JSON.stringify(manifest)).body, blob: { pathname, size: 300 } }) : get(pathname, options);
    const { res, calls } = await run({ blobSdk }); assert.equal(res.statusCode, 503); assert.equal(calls.length, 1); assert.equal(blobSdk.records.size, 0); assert.ok(!blobSdk.calls.some(x => x.method === 'put'));
  });
}
test('frozen envelope and key are reused after renderer changes', async () => {
  const blobSdk = fakeBlob(); const { createPrivateStore } = require('../lib/inquiry-store'); const storage = createPrivateStore(env, blobSdk);
  const first = await storage.prepare(validate(valid), env.INQUIRY_RATE_LIMIT_SALT, () => ({ payload: 'original bytes', idempotencyKey: 'original key' }));
  const retry = await storage.prepare(validate(valid), env.INQUIRY_RATE_LIMIT_SALT, () => { throw new Error('new template must not be evaluated for an existing submission'); });
  assert.deepEqual(retry.record.notification.envelope, first.record.notification.envelope);
});
test('changed sender or recipient configuration cannot reroute or re-key an ambiguous send', async () => {
  const blobSdk = fakeBlob(); await run({ blobSdk, responses: [fakeResponse(200, { result: [1, 0] }), fakeResponse(500, {})] });
  const before = JSON.parse([...blobSdk.records.values()][0].body).notification.envelope;
  const changed = await run({ blobSdk, config: { ...env, INQUIRY_TO_EMAIL: 'different@example.test' } }); assert.equal(changed.res.statusCode, 503); assert.equal(changed.calls.length, 1);
  assert.deepEqual(JSON.parse([...blobSdk.records.values()][0].body).notification.envelope, before);
});
test('same details with a new logical UUID create a legitimate new inquiry', async () => {
  const blobSdk = fakeBlob(); const first = await run({ blobSdk }); const second = await run({ blobSdk, body: { ...valid, submissionId: '104ebc7b-a722-4d93-8ad2-50a3d3e23466' } });
  assert.equal(first.res.statusCode, 200); assert.equal(second.res.statusCode, 200); assert.equal(blobSdk.records.size, 2); assert.equal(second.calls.length, 2);
  assert.notEqual(first.calls[1][1].headers['Idempotency-Key'], second.calls[1][1].headers['Idempotency-Key']);
});
test('JSON requires a logical submission ID', async () => { const body = { ...valid }; delete body.submissionId; const { res, calls, blobSdk } = await run({ body }); assert.equal(res.statusCode, 400); assert.equal(calls.length, 0); assert.equal(blobSdk.calls.length, 0); });
test('native initial review escapes fields, saves/sends nothing, then duplicate confirmation is deduped', async () => {
  const body = { ...valid, description: '<script>alert("no")</script> & project detail' }; delete body.submissionId;
  const headers = { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' }, blobSdk = fakeBlob();
  const review = await run({ body: new URLSearchParams(body).toString(), headers, blobSdk });
  assert.equal(review.res.statusCode, 200); assert.equal(review.calls.length, 0); assert.equal(blobSdk.calls.length, 0); assert.equal(review.res.headers['Cache-Control'], 'no-store'); assert.ok(!review.res.body.includes('<script>')); assert.ok(review.res.body.includes('&lt;script&gt;')); assert.match(review.res.body, /action="\/api\/inquiry" method="POST"/);
  const submissionId = review.res.body.match(/name="submissionId" value="([a-f0-9-]+)"/)[1];
  const confirmedBody = new URLSearchParams({ ...body, submissionId }).toString();
  const confirmed = await run({ body: confirmedBody, headers, blobSdk }); const repeat = await run({ body: confirmedBody, headers, blobSdk });
  assert.equal(confirmed.res.statusCode, 303); assert.equal(repeat.res.statusCode, 303); assert.equal(repeat.calls.length, 1); assert.equal(blobSdk.records.size, 1);
});
test('native cutover accepts and discards exact existing Formspree hidden metadata', async () => {
  const body = new URLSearchParams({ ...valid, _subject: 'New Haven Design & Build inquiry', _next: 'https://www.designhavenbuild.com/#thanks' }).toString();
  const { res, blobSdk } = await run({ body, headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' } });
  assert.equal(res.statusCode, 303); const record = JSON.parse([...blobSdk.records.values()][0].body); assert.equal(record.inquiry._subject, undefined); assert.equal(record.inquiry._next, undefined);
});
