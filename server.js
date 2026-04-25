const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    version: "2.0",
  });
});

/* =========================
   STRESS TEST API
========================= */
app.post("/analyze", async (req, res) => {
  const { url, count = 50, concurrency = 10, method = "GET" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const safeCount = Math.min(Number(count), 1000);
  const safeConcurrency = Math.min(Number(concurrency), 50);

  let success = 0;
  let fail = 0;
  let times = [];

  const tasks = Array.from({ length: safeCount });

  async function sendRequest() {
    const start = Date.now();

    try {
      await axios({ method, url, timeout: 5000 });
      success++;
    } catch (err) {
      fail++;
    }

    times.push(Date.now() - start);
  }

  async function worker() {
    while (tasks.length > 0) {
      tasks.pop();
      await sendRequest();
    }
  }

  const workers = Array.from({ length: safeConcurrency }, worker);
  await Promise.all(workers);

  const total = success + fail;

  const avg =
    times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;

  res.json({
    totalRequests: total,
    success,
    fail,
    successRate: ((success / total) * 100 || 0).toFixed(2) + "%",
    failRate: ((fail / total) * 100 || 0).toFixed(2) + "%",
    avgResponseTime: avg.toFixed(2) + " ms",
    minResponseTime: Math.min(...times) || 0,
    maxResponseTime: Math.max(...times) || 0,
    throughput: (total / (avg / 1000 || 1)).toFixed(2) + " req/sec",
  });
});

/* =========================
   SERVE FRONTEND SAFELY
========================= */

const distPath = path.join(__dirname, "dist");
const indexPath = path.join(distPath, "index.html");

// Only serve frontend if it exists (prevents Render crash)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log("✅ Frontend build found. Serving static files.");
} else {
  console.log("⚠️ No dist folder found. API-only mode.");
}

// React fallback route
app.get("*", (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send("API Server Running (Frontend not built)");
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});