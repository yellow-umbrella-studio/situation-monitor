const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { parse } = require("node-html-parser");

admin.initializeApp();
const db = admin.firestore();

// ─── RSS Proxy ───────────────────────────────────────────────────

exports.rssProxy = onRequest(
  { cors: true, region: "us-central1", maxInstances: 10, memory: "256MiB" },
  async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).json({ error: "Missing 'url' query parameter" });
      return;
    }
    const allowed = [
      "news.google.com", "feeds.bbci.co.uk", "rss.nytimes.com",
      "feeds.reuters.com", "rss.cnn.com", "feeds.arstechnica.com",
      "feeds.feedburner.com",
    ];
    let hostname;
    try { hostname = new URL(targetUrl).hostname; } catch {
      res.status(400).json({ error: "Invalid URL" }); return;
    }
    if (!allowed.some((d) => hostname === d || hostname.endsWith("." + d))) {
      res.status(403).json({ error: "Domain not allowed" }); return;
    }
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!response.ok) {
        res.status(response.status).json({ error: `Upstream returned ${response.status}` }); return;
      }
      const xml = await response.text();
      res.set("Cache-Control", "public, s-maxage=600, max-age=300");
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error) {
      console.error("RSS proxy error:", error);
      res.status(502).json({ error: "Failed to fetch RSS feed" });
    }
  }
);

// ─── Conflicts Scraper ───────────────────────────────────────────

async function scrapeCFRConflicts() {
  try {
    const res = await fetch("https://www.cfr.org/global-conflict-tracker", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // The CFR page embeds the features array as `features: [...]`
    // inside an HTML-escaped JS string with backslash-escaped quotes (\")
    const marker = "features: [";
    const idx = html.indexOf(marker);
    if (idx === -1) {
      console.error("CFR: features marker not found");
      return [];
    }

    const arrStart = idx + marker.length - 1; // points at "["

    // The content uses JS string-escaped quotes (\"), so we need a custom
    // bracket matcher that respects the escaping convention.
    let depth = 0;
    let endIdx = -1;
    for (let i = arrStart; i < html.length; i++) {
      const c = html[i];
      if (c === "[") depth++;
      else if (c === "]") {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
    if (endIdx === -1) {
      console.error("CFR: failed to find end of features array");
      return [];
    }

    const rawArr = html.substring(arrStart, endIdx + 1);

    // The data has doubled-escaped quotes (\\\") and JS escapes. Unescape.
    const cleaned = rawArr
      .replace(/\\u002F/g, "/")
      .replace(/\\\//g, "/")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, " ")
      .replace(/\\t/g, " ");

    let features;
    try {
      features = JSON.parse(cleaned);
    } catch (e) {
      console.error("CFR: JSON parse failed", e?.message);
      return [];
    }

    const all = features.map((f) => {
      const p = f.properties || {};
      const sev = (p.severity?.us?.value || "").toLowerCase();
      const status = p.severity?.usConflictStatus?.value || "Unchanging";
      return {
        id: (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: p.title || "",
        type: p.conflictType || "",
        region: p.region || "",
        severity: sev === "critical" ? "critical" : sev === "significant" ? "high" : "moderate",
        rawSeverity: p.severity?.us?.value || "",
        status,
        coordinates: f.geometry?.coordinates || null,
        link: p.link ? `https://www.cfr.org${p.link}` : "",
        image: p.image || p.mobileImage || "",
      };
    }).filter((c) => c.name);

    // Filter: only major ones (Critical OR Significant OR Worsening)
    const major = all.filter((c) => {
      const isMajor = c.severity === "critical" || c.severity === "high";
      const isWorsening = c.status.toLowerCase().includes("worsen");
      return isMajor || isWorsening;
    });

    // Sort: Critical first, then Worsening, then by severity
    const severityRank = { critical: 0, high: 1, moderate: 2 };
    const sorted = major.sort((a, b) => {
      const aWorsening = a.status.toLowerCase().includes("worsen") ? 0 : 1;
      const bWorsening = b.status.toLowerCase().includes("worsen") ? 0 : 1;
      const aRank = severityRank[a.severity] || 3;
      const bRank = severityRank[b.severity] || 3;
      // Prioritize critical, then worsening within tier
      if (aRank !== bRank) return aRank - bRank;
      return aWorsening - bWorsening;
    });

    return sorted;
  } catch (e) {
    console.error("CFR scrape failed:", e);
    return [];
  }
}

async function mergeConflicts() {
  return await scrapeCFRConflicts();
}

// ─── Scheduled scraper (runs every 12 hours) ─────────────────────

exports.scrapeConflicts = onSchedule(
  { schedule: "every 12 hours", region: "us-central1", memory: "512MiB", timeoutSeconds: 120 },
  async () => {
    const conflicts = await mergeConflicts();
    await db.collection("data").doc("conflicts").set({
      conflicts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      count: conflicts.length,
    });
    console.log(`Scraped ${conflicts.length} conflicts`);
  }
);

// ─── Manual trigger endpoint ─────────────────────────────────────

exports.refreshConflicts = onRequest(
  {
    cors: true,
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
    invoker: "public",
  },
  async (req, res) => {
    try {
      const conflicts = await mergeConflicts();
      try {
        await db.collection("data").doc("conflicts").set({
          conflicts,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          count: conflicts.length,
        });
      } catch (dbErr) {
        console.error("Firestore write failed:", dbErr);
      }
      res.json({ success: true, count: conflicts.length, conflicts });
    } catch (err) {
      console.error("refreshConflicts error:", err);
      res.status(500).json({ error: String(err?.message || err) });
    }
  }
);
