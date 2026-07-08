const {
  forwardToMissionControl,
  isAdminRequest,
  readJson,
  sanitizeTicket,
  sendJson
} = require("./_mission-control");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const body = await readJson(req);
    const ticket = sanitizeTicket({
      ...body,
      source: body.source === "admin" && isAdminRequest(req) ? "admin" : "website_helper",
      userAgent: body.userAgent || req.headers["user-agent"] || ""
    });

    if (!ticket.message || ticket.message.length < 8) {
      return sendJson(res, 400, { ok: false, error: "Please include a little more detail." });
    }

    const missionControl = await forwardToMissionControl(ticket);
    return sendJson(res, missionControl.sent ? 200 : 202, {
      ok: true,
      ticketId: ticket.id,
      missionControl
    });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message || "Support ticket failed" });
  }
};
