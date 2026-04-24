const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint (for browser check)
app.get("/", (req, res) => {
  res.send("API Performance Analyzer v2 running");
});

// Analyze endpoint
app.post("/analyze", async (req, res) => {
  const { url, count } = req.body;

  if (!url || !count) {
    return res.status(400).json({
      error: "Please provide 'url' and 'count'",
    });
  }

  let success = 0;
  let fail = 0;
  let totalTime = 0;

  for (let i = 0; i < count; i++) {
    const start = Date.now();

    try {
      await axios.get(url);
      success++;
    } catch (err) {
      fail++;
    }

    const end = Date.now();
    totalTime += end - start;
  }

  const averageTime = (totalTime / count).toFixed(2) + " ms";

  res.json({
    totalRequests: count,
    success,
    fail,
    averageTime,
  });
});

// IMPORTANT: Dynamic port for deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});