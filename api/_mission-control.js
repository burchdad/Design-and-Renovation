const crypto = require("crypto");

const ADMIN_PASSWORD_HASH = "fba10e7d10174a304270e48074be22b8fce8fb8beece1e35f816a9aa746e47d4";
const SESSION_COOKIE = "haven_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function sha256(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function safeEqual(left = "", right = "") {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getAdminPasswordHash() {
  return process.env.HAVEN_ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH;
}

function getSessionSecret() {
  return process.env.HAVEN_ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || getAdminPasswordHash();
}

function sign(value) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function createSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = crypto.randomBytes(12).toString("hex");
  const value = `${expires}.${nonce}`;
  return `${value}.${sign(value)}`;
}

function verifySessionToken(token = "") {
  const parts = String(token).split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, signature] = parts;
  if (!expires || !nonce || !signature) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(`${expires}.${nonce}`));
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function isAdminRequest(req) {
  const cookies = parseCookies(req);
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return verifySessionToken(cookies[SESSION_COOKIE] || bearer);
}

function setSessionCookie(res, token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getMissionEndpoint() {
  const direct = process.env.GHOST_MISSION_CONTROL_WEBHOOK_URL || process.env.MISSION_CONTROL_WEBHOOK_URL;
  if (direct) return direct;

  const base = process.env.GHOST_MISSION_CONTROL_URL || process.env.MISSION_CONTROL_URL;
  if (!base) return "";
  const path = process.env.GHOST_MISSION_CONTROL_TICKET_PATH || process.env.MISSION_CONTROL_TICKET_PATH || "/api/support/tickets";
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function getMissionHeaders() {
  const token =
    process.env.GHOST_MISSION_CONTROL_API_KEY ||
    process.env.MISSION_CONTROL_API_KEY ||
    process.env.GHOST_MISSION_CONTROL_TOKEN ||
    process.env.MISSION_CONTROL_TOKEN ||
    process.env.CRON_SECRET ||
    "";

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}`, "x-mission-control-token": token } : {})
  };
}

function missionStatus() {
  return {
    endpointConfigured: Boolean(getMissionEndpoint()),
    authConfigured: Boolean(
      process.env.GHOST_MISSION_CONTROL_API_KEY ||
      process.env.MISSION_CONTROL_API_KEY ||
      process.env.GHOST_MISSION_CONTROL_TOKEN ||
      process.env.MISSION_CONTROL_TOKEN ||
      process.env.CRON_SECRET
    )
  };
}

async function forwardToMissionControl(ticket) {
  const endpoint = getMissionEndpoint();
  if (!endpoint) {
    return { sent: false, status: 0, detail: "Mission Control webhook URL is not configured." };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: getMissionHeaders(),
    body: JSON.stringify({
      type: "website_support_ticket",
      source: "designhavenbuild.com",
      client: {
        name: "Haven Design & Build LLC",
        website: "https://www.designhavenbuild.com/"
      },
      ticket
    })
  });

  const text = await response.text();
  return {
    sent: response.ok,
    status: response.status,
    detail: text.slice(0, 600)
  };
}

function sanitizeTicket(input = {}) {
  const now = new Date().toISOString();
  return {
    id: `haven-${Date.now()}`,
    createdAt: now,
    source: input.source === "admin" ? "admin" : "website_helper",
    priority: String(input.priority || "normal").slice(0, 40),
    category: String(input.category || "General Support").slice(0, 80),
    name: String(input.name || "").trim().slice(0, 120),
    email: String(input.email || "").trim().slice(0, 160),
    phone: String(input.phone || "").trim().slice(0, 80),
    subject: String(input.subject || "Website support request").trim().slice(0, 160),
    message: String(input.message || "").trim().slice(0, 4000),
    pageUrl: String(input.pageUrl || "").slice(0, 500),
    userAgent: String(input.userAgent || "").slice(0, 300),
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {}
  };
}

module.exports = {
  clearSessionCookie,
  createSessionToken,
  forwardToMissionControl,
  getAdminPasswordHash,
  isAdminRequest,
  missionStatus,
  readJson,
  sanitizeTicket,
  sendJson,
  setSessionCookie,
  sha256,
  safeEqual
};
