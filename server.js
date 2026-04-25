const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
====================================================
 HEALTH CHECK
====================================================
*/
app.get("/", (req, res) => {
  res.json({
    status: "API Stress Tester running",
    version: "2.0",
  });
});

/*
====================================================
 STRESS TEST ENGINE (UPGRADED)
====================================================
*/
app.post("/analyze", async (req, res) => {
  const {
    url,
    count = 50,
    concurrency = 10,
    method = "GET",
  } = req.body;

  if (!url) {
    return res.status(400).json({
      error: "URL is required",
    });
  }

  const safeCount = Math.min(count, 1000);
  const safeConcurrency = Math.min(concurrency, 50);

  let success = 0;
  let fail = 0;
  let times = [];

  const tasks = Array.from({ length: safeCount });

  async function sendRequest() {
    const start = Date.now();

    try {
      await axios({
        method,
        url,
        timeout: 5000,
      });

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

  const workers = Array.from(
    { length: safeConcurrency },
    worker
  );

  await Promise.all(workers);

  const total = times.length;

  const avg =
    times.reduce((a, b) => a + b, 0) / total;

  const min = Math.min(...times);
  const max = Math.max(...times);

  const successRate = ((success / total) * 100).toFixed(2);

  const failRate = ((fail / total) * 100).toFixed(2);

  res.json({
    totalRequests: total,
    success,
    fail,
    successRate: successRate + "%",
    failRate: failRate + "%",
    avgResponseTime: avg.toFixed(2) + " ms",
    minResponseTime: min + " ms",
    maxResponseTime: max + " ms",
    throughput: (total / (avg / 1000)).toFixed(2) + " req/sec",
  });
});

/*
====================================================
 SERVER START
====================================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});