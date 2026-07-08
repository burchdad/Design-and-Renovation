const {
  createSessionToken,
  getAdminPasswordHash,
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
    const body = await readJson(req);
    const passwordHash = sha256(body.password || "");
    if (!safeEqual(passwordHash, getAdminPasswordHash())) {
      return sendJson(res, 401, { ok: false, error: "Invalid admin password" });
    }

    const token = createSessionToken();
    setSessionCookie(res, token);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: error.message || "Login failed" });
  }
};
