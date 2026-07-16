const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const publicHtmlFiles = [
  "index.html",
  "404.html",
  "areas/index.html",
  "areas/marietta-ga/index.html",
  "areas/cobb-county-ga/index.html",
  "areas/atlanta-ga/index.html",
  "services/kitchen-remodeling-marietta-ga/index.html",
  "services/bathroom-remodeling-marietta-ga/index.html",
  "services/basement-finishing-marietta-ga/index.html",
  "services/deck-builder-marietta-ga/index.html",
  "services/commercial-renovation-marietta-ga/index.html",
  "resources/index.html",
  "resources/how-to-plan-kitchen-remodel-marietta-ga/index.html",
  "resources/questions-before-hiring-renovation-contractor/index.html",
  "home-renovation-companies-marietta-ga/index.html",
  "why-haven-renovation-contractor-marietta-ga/index.html"
];

const homepage = read("index.html");
const ownerLoginMatches = [...homepage.matchAll(/<a\b[^>]*href="\/admin\/"[^>]*>Owner Login<\/a>/g)];
if (ownerLoginMatches.length !== 1) {
  fail(`Expected exactly one Owner Login footer link, found ${ownerLoginMatches.length}.`);
}

if (!ownerLoginMatches[0]?.[0]?.includes('rel="nofollow"')) {
  fail("Owner Login link must include rel=\"nofollow\".");
}

if (/Admin Dashboard/i.test(homepage)) {
  fail("Admin Dashboard must not appear in public homepage HTML.");
}

const sitemap = read("sitemap.xml");
if (/\/admin\//i.test(sitemap)) {
  fail("sitemap.xml must not include admin URLs.");
}

const adminHtml = read("admin/index.html");
if (!/noindex,\s*nofollow,\s*noarchive,\s*nosnippet/i.test(adminHtml)) {
  fail("Admin page must contain noindex, nofollow, noarchive, nosnippet.");
}

const publicForbidden = [
  /Mission Control/i,
  /webhook/i,
  /repository/i,
  /Vercel project/i,
  /API endpoint/i,
  /backend architecture/i,
  /ticket system internals/i,
  /Admin Dashboard/i
];

for (const file of publicHtmlFiles) {
  const html = read(file);
  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [index, block] of jsonLdBlocks.entries()) {
    if (/\/admin\//i.test(block)) {
      fail(`${file} JSON-LD block ${index + 1} contains an admin URL.`);
    }
  }
  for (const pattern of publicForbidden) {
    if (pattern.test(html)) {
      fail(`${file} contains public internal language matching ${pattern}.`);
    }
  }
}

const adminApi = read("api/support-ticket.js");
if (!/isAdmin\s*&&\s*!isAdminRequest/.test(adminApi)) {
  fail("Admin-origin support ticket writes must reject unauthenticated requests.");
}

const loginApi = read("api/admin-login.js");
if (/Invalid admin password|incorrect password|user does not exist|email not found/i.test(loginApi)) {
  fail("Admin login API contains non-generic authentication error wording.");
}

const vercel = JSON.parse(read("vercel.json"));
const adminHeader = JSON.stringify(vercel.headers || []);
if (!/noindex, nofollow, noarchive, nosnippet/.test(adminHeader)) {
  fail("vercel.json must set strong X-Robots-Tag controls for private routes.");
}

if (!process.exitCode) {
  console.log("Admin access validation passed.");
}
