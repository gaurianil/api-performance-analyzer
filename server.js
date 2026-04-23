const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Check server
app.get("/", (req, res) => {
    res.send("API Performance Analyzer is running");
});

// Main logic
app.post("/analyze", async (req, res) => {
    const { url, count } = req.body;

    if (!url || !count) {
        return res.status(400).json({
            error: "Please provide both 'url' and 'count'"
        });
    }

    let success = 0;
    let fail = 0;
    let totalTime = 0;

    for (let i = 0; i < count; i++) {
        const start = Date.now();

        try {
            await axios.get(url);
            const end = Date.now();
            totalTime += (end - start);
            success++;
        } catch (error) {
            fail++;
        }
    }

    const averageTime = success > 0 ? totalTime / success : 0;

    res.json({
        totalRequests: count,
        success,
        fail,
        averageTime: `${averageTime} ms`
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});