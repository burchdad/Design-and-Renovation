'use strict';
const { BlobPreconditionFailedError, BlobError } = require('@vercel/blob');
const storageEnv = { VERCEL_ENV: 'preview', HAVEN_INQUIRY_ENVIRONMENT: 'preview', INQUIRY_STORAGE_VERIFIED: 'true', INQUIRY_RETENTION_APPROVED: 'true', INQUIRY_RETENTION_ENFORCED: 'true', INQUIRY_RETENTION_DAYS: '30', HAVEN_INQUIRY_BLOB_STORE_ID: 'store_havenoffline1234', BLOB_STORE_ID: 'store_havenoffline1234', HAVEN_INQUIRY_VERCEL_PROJECT_ID: 'prj_havenoffline', VERCEL_PROJECT_ID: 'prj_havenoffline', VERCEL_OIDC_TOKEN: 'offline-placeholder-not-a-token' };
function fakeBlob() {
  const records = new Map(), calls = []; let version = 0;
  return {
    records, calls, BlobPreconditionFailedError,
    async get(pathname, options) {
      calls.push({ method: 'get', pathname, options });
      if (pathname === 'haven/ownership.json') {
        const manifest = { schema: 1, site: 'haven', access: 'private', purpose: 'inquiry-intake', storeId: 'havenoffline1234', projectId: 'prj_havenoffline', environment: 'preview', allowedSites: ['haven'] };
        return { statusCode: 200, stream: new Response(JSON.stringify(manifest)).body, blob: { pathname, etag: 'ownership-etag', size: 300 } };
      }
      const entry = records.get(pathname);
      return entry ? { statusCode: 200, stream: new Response(entry.body).body, blob: { pathname, etag: entry.etag, size: Buffer.byteLength(entry.body) } } : null;
    },
    async put(pathname, body, options) {
      calls.push({ method: 'put', pathname, options, body });
      const entry = records.get(pathname);
      if (entry && !options.allowOverwrite) throw new BlobError('already exists');
      if (options.ifMatch && options.ifMatch !== entry?.etag) throw new BlobPreconditionFailedError();
      const etag = `"offline-version-${++version}"`;
      records.set(pathname, { body, etag });
      return { pathname, etag };
    }
  };
}
module.exports = { fakeBlob, storageEnv };
