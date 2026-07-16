const { clearSessionCookie, isAdminRequest, missionStatus, sendJson } = require("./_mission-control");

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    clearSessionCookie(res);
    return sendJson(res, 200, { ok: true, loggedOut: true });
  }

  const authenticated = isAdminRequest(req);
  return sendJson(res, 200, {
    ok: true,
    authenticated,
    missionControl: authenticated ? missionStatus() : undefined
  });
};
