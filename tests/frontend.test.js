'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../js/app.js'), 'utf8');
function setup(fetchImpl, action = '/api/inquiry', sessionStorage) {
  const events = [], timers = [];
  const button = { disabled: false, textContent: 'Submit Project Details' };
  const message = { style: {}, textContent: '', className: '' };
  const data = { name: 'Alex Example', email: 'alex@example.test', phone: '770-555-0100', zip: '30060', description: 'A kitchen remodel', service: 'Kitchen Remodel', projectType: 'Residential', conversion_path: 'homepage_project_fit_review', website: '' };
  const form = { action, getAttribute: () => action, attributes: {}, resetCount: 0, addEventListener() {}, querySelector: () => button, setAttribute(k,v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; }, reset() { this.resetCount++; } };
  const window = { location: { href: 'https://www.designhavenbuild.com/#inquire', hash: 'inquire' }, gtag: (_type, name, props) => events.push({ name, props }) };
  const context = vm.createContext({ window, document: { getElementById: (id) => id === 'inquireForm' ? form : message, addEventListener() {} }, FormData: class { constructor() { this.values = { ...data }; } get(key) { return this.values[key]; } set(key, value) { this.values[key] = value; } delete(key) { delete this.values[key]; } }, fetch: fetchImpl, sessionStorage, crypto: require('node:crypto').webcrypto, AbortController, Date, console, setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; }, clearTimeout() {} });
  vm.runInContext(source + '\nglobalThis.handler = new FormHandler();', context);
  const submit = () => context.handler.handleSubmit({ preventDefault() {} });
  return { submit, handler: context.handler, form, button, message, data, window, events, timers };
}
const result = (status, body) => ({ ok: status === 200, status, json: async () => body });
test('success resets once, records one conversion, restores current CTA and uses same-origin JSON', async () => {
  let request;
  const ui = setup(async (url, init) => { request = { url, init }; return result(200, { ok: true }); });
  await ui.submit();
  assert.equal(request.url, '/api/inquiry'); assert.equal(request.init.credentials, 'same-origin');
  assert.equal(JSON.parse(request.init.body).conversion_path, 'homepage_project_fit_review');
  assert.equal(ui.form.resetCount, 1); assert.equal(ui.window.location.hash, 'thanks'); assert.equal(ui.button.textContent, 'Submit Project Details'); assert.equal(ui.button.disabled, false); assert.equal(ui.events.filter(x => x.name === 'generate_lead').length, 1); assert.equal(ui.form.attributes['aria-busy'], undefined);
});
for (const response of [result(503, { ok: false }), result(429, { ok: false }), result(400, { ok: false }), result(200, { ok: false }), { ok: true, status: 200, json: async () => { throw new Error('bad JSON'); } }]) {
  test('failed or malformed response preserves all data and never tracks a lead', async () => { const ui = setup(async () => response); await ui.submit(); assert.equal(ui.form.resetCount, 0); assert.equal(ui.window.location.hash, 'inquire'); assert.equal(ui.button.disabled, false); assert.equal(ui.button.textContent, 'Submit Project Details'); assert.equal(ui.message.style.display, 'block'); assert.equal(ui.events.filter(x => x.name === 'generate_lead').length, 0); assert.equal(ui.timers.length, 1); });
}
test('duplicate submit while pending sends only once', async () => {
  let resolve, calls = 0;
  const ui = setup(async () => { calls++; return new Promise((r) => { resolve = r; }); });
  const first = ui.submit(); await ui.submit(); assert.equal(calls, 1); assert.equal(ui.button.disabled, true); assert.equal(ui.form.attributes['aria-busy'], 'true'); resolve(result(200, { ok: true })); await first; assert.equal(ui.form.resetCount, 1);
});
test('ambiguous delivery retry preserves timestamp and body for provider dedupe', async () => {
  const bodies = [];
  const ui = setup(async (_url, init) => { bodies.push(init.body); return result(503, { ok: false }); });
  await ui.submit(); await ui.submit(); assert.equal(bodies[0], bodies[1]); assert.equal(ui.form.resetCount, 0);
});
test('network failure preserves values and restores submit button', async () => { const ui = setup(async () => { throw new Error('offline'); }); await ui.submit(); assert.equal(ui.form.resetCount, 0); assert.equal(ui.button.disabled, false); assert.match(ui.message.textContent, /details are still here/); });
test('30 second client timeout aborts and presents retry guidance', async () => {
  const ui = setup(async (_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('timeout'), { name: 'AbortError' })))));
  const pending = ui.submit(); assert.equal(ui.timers[0].delay, 30000); ui.timers[0].fn(); await pending; assert.equal(ui.form.resetCount, 0); assert.equal(ui.button.disabled, false); assert.ok(ui.events.some(x => x.props.event_label === 'submission_timeout'));
});
test('invalid client email prevents API call', async () => { let called = false; const ui = setup(async () => { called = true; }); ui.data.email = 'invalid'; await ui.submit(); assert.equal(called, false); assert.equal(ui.form.resetCount, 0); });
test('markup preserves heading, live status, existing Formspree default and all field options', () => {
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  assert.match(html, /id="inquireForm"[^>]*aria-labelledby="inquiry-title"[^>]*action="https:\/\/formspree\.io\/f\/xlgvyvkp"/);
  assert.match(html, /id="formMessage"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /name="website" tabindex="-1" autocomplete="off"/);
  assert.ok(html.includes('formspree.io/f/xlgvyvkp')); assert.match(source, /useResend \? '\/api\/inquiry' : this.form.action/);
  assert.match(source, /heading.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /homepage_project_fit_review/);
  for (const value of require('../lib/inquiry').SERVICES.concat(require('../lib/inquiry').PROJECT_TYPES)) assert.ok(html.includes(`value="${value}"`));
});

test('preview default preserves Formspree transport and existing notification metadata', async () => {
  let request;
  const action = 'https://formspree.io/f/xlgvyvkp';
  const ui = setup(async (url, init) => { request = { url, init }; return { ok: true, status: 200 }; }, action);
  await ui.submit();
  assert.equal(request.url, action); assert.equal(request.init.headers['Content-Type'], undefined);
  assert.equal(request.init.body.get('_replyto'), 'alex@example.test'); assert.equal(request.init.body.get('_gotcha'), '');
  assert.match(request.init.body.get('_subject'), /Kitchen Remodel/); assert.equal(ui.form.resetCount, 1);
});
test('logical UUID survives a same-tab page reload after failure without storing contact data', async () => {
  const values = new Map(); const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; const bodies = [];
  const fail = async (_url, init) => { bodies.push(JSON.parse(init.body)); return result(503, { ok: false }); };
  await setup(fail, '/api/inquiry', storage).submit(); await setup(fail, '/api/inquiry', storage).submit();
  assert.equal(bodies[0].submissionId, bodies[1].submissionId); assert.equal(values.size, 1); assert.match([...values.values()][0], /^[a-f0-9-]{36}$/);
  await setup(async () => result(200, { ok: true }), '/api/inquiry', storage).submit(); assert.equal(values.size, 0);
});
