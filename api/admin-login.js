const {
  createSessionToken,
  getAdminPasswordHash,
  isLoginRateLimited,
  recordLoginAttempt,
  readJson,
  safeEqual,
  sendJson,
  setSessionCookie,
  sha256
} = require("./_mission-control");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    if (isLoginRateLimited(req)) {
      return sendJson(res, 429, { ok: false, error: "Unable to sign in with those credentials." });
    }

    const body = await readJson(req);
    const passwordHash = sha256(body.password || "");
    if (!safeEqual(passwordHash, getAdminPasswordHash())) {
      recordLoginAttempt(req, false);
      return sendJson(res, 401, { ok: false, error: "Unable to sign in with those credentials." });
    }

    recordLoginAttempt(req, true);
    const token = createSessionToken();
    setSessionCookie(res, token);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    recordLoginAttempt(req, false);
    return sendJson(res, 400, { ok: false, error: "Unable to sign in with those credentials." });
  }
};
