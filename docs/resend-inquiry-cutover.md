# Haven inquiry migration: review only

## Base and present behavior

Pinned production base: `6c5daf10ffa13db4b041a8db17710e6b5ae48449`, branch
`codex/haven-inquiry-review`. The older `main` and premium-preview branches are
not a safe base for this work. The Oct 13 inquiry/navigation/accessibility changes
are preserved.

The HTML form action is still `https://formspree.io/f/xlgvyvkp`. Both JavaScript
and native form submissions continue to use it. No browser probe, environment
flag or API response switches the form automatically. An eventual, separately
approved cutover changes only that action to `/api/inquiry`. The browser then
uses the new JSON transport. There is no dual-send or automatic provider fallback.

Do not retire Formspree, remove its saved submissions, or replace its endpoint
while reviewing this patch. `review/inquiry-email.html` is a synthetic-only,
noindex email-layout preview. It sends nothing and contains no real contact data.

## Replacement flow

1. POST only; require a configured HTTPS origin and reject cross-site requests.
2. Enforce a 16 KiB body limit, string/field allowlist, email/phone/ZIP limits,
   enumerated service/project types and a honeypot. Never accept caller-supplied
   sender, recipient, subject, storage pathname or store ID.
3. Atomically apply shared Upstash counters: five attempts per IP per 10 minutes,
   and 60 total per hour. Redis receives HMAC IP identifiers only, never inquiry
   content. Trusted IPs are obtained only from Vercel's edge header. Failure is
   closed; this is not an in-process limiter.
4. Save the minimum inquiry fields privately in a dedicated Haven Blob store.
   Per-logical-submission UUIDs produce stable HMAC record IDs without exposing PII; a new logical inquiry may reuse the same details. Client timestamps are excluded from identity. The saved
   record contains the submitted fields, source, creation/expiry metadata and
   notification state. It excludes honeypot content, IP addresses and user agents.
5. Claim an ETag-conditional, one-minute notification lease; send an HTML + text
   Resend summary with Reply-To set to the validated visitor email. Phone, ZIP
   and free-text project detail stay in private storage. No private Blob URL is
   placed in the email, browser response or logs. The email includes a reference
   ID for retrieval through an approved private store workflow.
6. Mark `sent` only after Resend returns an ID and the state is persisted. This
   means provider acceptance, not verified inbox delivery. Failed notifications
   remain `pending` or in a recoverable `sending` lease. Saved inquiries survive
   notification outages.

Duplicate sent requests do not send again. The exact notification bytes, approved routing and provider key are frozen in the pending record before the first send. Retries reuse that envelope, including across template changes; changed sender/recipient configuration pauses the existing record for reconciliation. Concurrent writers use conditional ETags and cannot erase a newer
state. An ambiguous send is retried only within 23 hours of the first attempt,
inside Resend's 24-hour idempotency window. Older ambiguous records become
`needs_review` and must be reconciled with provider evidence before any resend.
Do not rotate the HMAC salt, alter routing/template semantics, or delete an outbox
record while it has an unresolved notification.

Timeouts: shared rate check 2 seconds, each Blob operation 3 seconds, Resend send
7 seconds, browser 30 seconds, Vercel function 30 seconds. A timeout never causes
an automatic fallback or false success. Client values remain for retry.

## Required release gates

No credentials, account permissions, configuration, store, retention policy,
real email test or deployment was created by this patch.

Mail and routing:
- `INQUIRY_RESEND_ENABLED=true` only for the authorized replacement deployment.
- `RESEND_API_KEY`: server-only, appropriately scoped key supplied securely.
- `INQUIRY_FROM_EMAIL`: explicitly approved address on a verified sending domain.
  Set `INQUIRY_SENDER_VERIFIED=true` only after provider/domain verification.
- `INQUIRY_TO_EMAIL`: supply the owner-confirmed notification recipient through
  private server-side release configuration. The user approved the destination
  on October 13, 2026; its exact value must not be published in this repository,
  PR text or previews. Inbox delivery has not been tested. This is notification routing only; the existing public fallback
  contact and unselected sender remain unchanged.
  Keep `INQUIRY_RECIPIENT_CONFIRMED=false`, `INQUIRY_RESEND_ENABLED=false` and
  `INQUIRY_APPROVED_TEST_PASSED=false` in review examples. Recipient approval
  alone does not authorize sending a test or enabling the replacement. Complete
  the separately authorized delivery and release checks before enabling them.
- `INQUIRY_APPROVED_TEST_PASSED=true`: only after a separately authorized,
  synthetic delivery test verifies inbox receipt, Reply-To, HTML/text and saved
  record. Unit-test success is not this approval. Perform that preflight through
  an authorized private test workflow before enabling public intake.
- `INQUIRY_ALLOWED_ORIGINS`: exact, comma-separated HTTPS origins; no wildcard,
  path or reflected Origin value. Review previews need explicit selection.

Private saved submissions:
- A dedicated private Haven-only Blob store, connected only to the approved
  Haven project/environments, with approved access boundaries.
- `HAVEN_INQUIRY_BLOB_STORE_ID` must equal Vercel's `BLOB_STORE_ID` after optional
  `store_` normalization. `HAVEN_INQUIRY_VERCEL_PROJECT_ID` must exactly match
  `VERCEL_PROJECT_ID`. These are checked before any SDK access. `HAVEN_INQUIRY_ENVIRONMENT` must also match `VERCEL_ENV`. A pre-existing private `haven/ownership.json` manifest must match site, exclusive allowedSites, store, project, purpose and environment before any record writes. This manifest must be created only during authorized provisioning after verifying actual store connections. The adapter never creates it. Every SDK call
  passes the chosen `storeId`, private access, and a fixed Haven pathname prefix.
- `INQUIRY_STORAGE_VERIFIED=true` only after private access, site/project binding,
  write/read, conditional-update and operator retrieval are verified.
- Use nonempty Vercel-managed short-lived OIDC. The adapter never reads or passes the
  token itself, and rejects an ambient `BLOB_READ_WRITE_TOKEN` so the SDK cannot
  silently fall back to a different store. Connecting the store/expanding access
  still requires authorization; this patch does neither.
- `INQUIRY_RETENTION_DAYS`: explicit approved integer, no default. The parser
  accepts 1–3650 days as a technical range, not a policy recommendation.
- `INQUIRY_RETENTION_APPROVED=true` and `INQUIRY_RETENTION_ENFORCED=true` only
  after retention, cleanup ownership and actual expiry enforcement are approved
  and verified. `expiresAt` is metadata, not Blob auto-deletion. No purge job is
  configured or implemented in this patch, so this remains a release blocker.

Spam and operations:
- Approved Upstash REST URL/token plus a high-entropy server-only HMAC salt of
  at least 32 characters. This store holds counters, not the retained inquiries.
- Verify these limits fit Haven's legitimate lead volume and shared-network use.
  An attacker can deliberately exhaust a global cap. Add/verify edge protection
  and operational alerting as appropriate before public cutover.
- Verify an approved operator can retrieve private records and review failed
  notifications. There is no new public listing, retry, download or admin route.
  There is no scheduled retry worker. Record inspection/reconciliation remains
  an operational release requirement; this is not a complete CRM.

All configuration must be server-side. Do not add secret values to this file,
`.env.example`, frontend bundles, source control or test screenshots.

## Staged acceptance and rollback

- Review this branch/PR and the synthetic preview while the current Formspree
  route remains unchanged. A preview deployment is not production cutover.
- The notification recipient is user-approved and recorded in private release
  configuration; delivery remains untested. Approve the sender, private store/access, retention and rate
  service before the separately authorized delivery preflight.
  Check storage/rate costs, shared Resend limits and existing routing first.
- Run the specifically authorized synthetic inbox/storage acceptance test.
  Validate the actual Node 24 Vercel build, private OIDC scope, conditional writes,
  rate-limit behavior, desktop/mobile UX and email clients. Unit mocks alone do
  not prove these hosted behaviors.
- Confirm saved Formspree history/export handling without deleting it. Resolve
  pending outbox records, then approve the action change to `/api/inquiry`.
- Verify production commit, routing, one successful approved submission and the
  corresponding private record/provider receipt. Only then consider removing
  Formspree service dependencies through a separately authorized cleanup.
- Rollback routing by restoring the exact original Formspree action and deploying
  the approved rollback. Preserve all private records and reconcile ambiguous
  sends before inviting visitors to retry through a different provider.

## Verification evidence

- Pinned source files verified against Git blob hashes before editing.
- `npm ci --ignore-scripts`: locked official `@vercel/blob` 2.8.1 dependency.
- `npm test`: API, frontend, privacy, configuration, write-before-send, outbox,
  duplicate/concurrent/race, provider timeout and safe-retry cases use fake
  network and Blob implementations only.
- `npm run check`: syntax plus the repository's existing admin-access validator.
- Chromium launch was attempted locally, including the supported escalation,
  but the executor blocks browser sockets. Browser and actual email-client
  rendering remain unverified. Use the separate cloud browser on the authorized
  HTTPS review deployment; do not submit its active Formspree form as a test.
- Real delivery, private-store authorization, real Redis Lua execution, Vercel
  build/routing and retention cleanup remain release checks, not claimed passes.

## Implementation references

Checked October 13, 2026:
- Resend send endpoint: https://resend.com/docs/api-reference/emails/send-email
- Resend idempotency: https://resend.com/docs/dashboard/emails/idempotency-keys
- Vercel Blob SDK (private/OIDC/storeId/ETag): https://vercel.com/docs/vercel-blob/using-blob-sdk
- Vercel trusted IP headers: https://vercel.com/docs/headers/request-headers
- Upstash REST/Lua commands: https://upstash.com/docs/redis/features/restapi

## JavaScript-disabled cutover flow

Until cutover, the original native Formspree action remains in place. After an
approved action change, a native POST without a logical UUID gets a small
no-store review page. All submitted values are escaped and carried in POST-only
hidden fields, never URL queries. No inquiry is saved and no email is sent at
this step. Its Confirm button POSTs the issued UUID; repeats of that confirmation
reuse the same record/key. The JavaScript flow retains only its UUID in same-tab session storage through failures and reloads, and clears it after success. No contact details are stored in the browser by this logic. A new inquiry after success, or a fresh browser tab/session, gets a new logical ID even when its details are identical.

## Ownership manifest shape

Created only after approved store provisioning and connection review, in the
chosen private store at `haven/ownership.json`:

```json
{
  "schema": 1,
  "site": "haven",
  "allowedSites": ["haven"],
  "access": "private",
  "purpose": "inquiry-intake",
  "storeId": "APPROVED_STORE_ID",
  "projectId": "APPROVED_PROJECT_ID",
  "environment": "APPROVED_ENVIRONMENT"
}
```

The manifest is an explicit ownership control backed by provisioning review; it
does not replace auditing Vercel's real store/project permission graph. Preview
and production connections must each match the selected manifest/environment.
