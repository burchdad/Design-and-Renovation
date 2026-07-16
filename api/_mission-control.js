const crypto = require("crypto");

const ADMIN_PASSWORD_HASH = "fba10e7d10174a304270e48074be22b8fce8fb8beece1e35f816a9aa746e47d4";
const SESSION_COOKIE = "haven_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginAttempts = new Map();

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
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.end(JSON.stringify(payload));
}

function getClientKey(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

function isLoginRateLimited(req) {
  const key = getClientKey(req);
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  if (record.resetAt <= now) {
    loginAttempts.set(key, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  return record.count >= LOGIN_MAX_ATTEMPTS;
}

function recordLoginAttempt(req, succeeded) {
  const key = getClientKey(req);
  if (succeeded) {
    loginAttempts.delete(key);
    return;
  }
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  if (record.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  record.count += 1;
  loginAttempts.set(key, record);
}

function getMissionEndpoint() {
  const direct = process.env.GHOST_MISSION_CONTROL_WEBHOOK_URL || process.env.MISSION_CONTROL_WEBHOOK_URL;
  if (direct) return direct;

  const base =
    process.env.GHOST_MISSION_CONTROL_URL ||
    process.env.MISSION_CONTROL_URL ||
    "https://ghostmissioncontrol-production.up.railway.app";
  if (!base) return "";
  const path = process.env.GHOST_MISSION_CONTROL_TICKET_PATH || process.env.MISSION_CONTROL_TICKET_PATH || "/mission/web-helper-requests";
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function getMissionSecret() {
  return String(
    process.env.GHOST_WEB_HELPER_WEBHOOK_SECRET ||
      process.env.GHOST_MISSION_CONTROL_WEBHOOK_SECRET ||
      process.env.CLIENT_PORTAL_GEO_WEBHOOK_SECRET ||
      process.env.CLIENT_PORTAL_PROPOSAL_WEBHOOK_SECRET ||
      process.env.GHOST_MISSION_CONTROL_API_KEY ||
      process.env.MISSION_CONTROL_API_KEY ||
      process.env.GHOST_MISSION_CONTROL_TOKEN ||
      process.env.MISSION_CONTROL_TOKEN ||
      process.env.CRON_SECRET ||
      ""
  ).trim();
}

function getMissionHeaders() {
  const token = getMissionSecret();

  return {
    "Content-Type": "application/json",
    ...(token ? {
      Authorization: `Bearer ${token}`,
      "x-ghost-webhook-secret": token,
      "x-webhook-secret": token,
      "x-mission-control-token": token
    } : {})
  };
}

function missionStatus() {
  return {
    endpointConfigured: Boolean(getMissionEndpoint()),
    authConfigured: Boolean(getMissionSecret())
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
      source: "client_admin_dashboard",
      requestType: "website_support",
      request_type: "website_support",
      priority: ticket.priority,
      summary: ticket.subject,
      title: ticket.subject,
      details: ticket.message,
      message: ticket.message,
      pageUrl: ticket.pageUrl,
      page_url: ticket.pageUrl,
      siteUrl: "https://www.designhavenbuild.com/",
      site_url: "https://www.designhavenbuild.com/",
      websiteUrl: "https://www.designhavenbuild.com/",
      website_url: "https://www.designhavenbuild.com/",
      clientName: "Haven Design & Build LLC",
      client_name: "Haven Design & Build LLC",
      client: "Haven Design & Build LLC",
      repo: "burchdad/Design-and-Renovation",
      githubRepo: "burchdad/Design-and-Renovation",
      webHelperId: "haven-design-build-web-helper",
      ticket,
      contact: {
        name: ticket.name,
        email: ticket.email,
        phone: ticket.phone
      },
      metadata: {
        ...ticket.metadata,
        sourceTicketId: ticket.id,
        source: ticket.source,
        category: ticket.category,
        userAgent: ticket.userAgent
      }
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
  isLoginRateLimited,
  missionStatus,
  recordLoginAttempt,
  readJson,
  sanitizeTicket,
  sendJson,
  setSessionCookie,
  sha256,
  safeEqual
};
