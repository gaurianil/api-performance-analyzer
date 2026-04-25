import { useState } from "react";
import axios from "axios";

export default function App() {
  const [url, setUrl] = useState("");
  const [count, setCount] = useState(50);
  const [concurrency, setConcurrency] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "https://api-performance-analyzer.onrender.com/analyze",
        {
          url,
          count,
          concurrency,
        }
      );
      setResult(res.data);
    } catch (err) {
      alert("Request failed");
    }

    setLoading(false);
  };

  return (
    <div className="app-grid">

      {/* LEFT PANEL */}
      <div className="card column">
        <h1>Stress Test</h1>
        <p>Run performance analysis on any API endpoint</p>

        <hr />

        <input
          placeholder="Enter API URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="column">
          <label>Requests: {count}</label>
          <input
            type="range"
            min="1"
            max="500"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />

          <label>Concurrency: {concurrency}</label>
          <input
            type="range"
            min="1"
            max="50"
            value={concurrency}
            onChange={(e) => setConcurrency(e.target.value)}
          />
        </div>

        <button className="primary" onClick={runTest}>
          {loading ? "Running..." : "Run Test"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="card">

        <h2>Results</h2>
        <p>Performance metrics will appear here</p>

        <hr />

        {!result && (
          <p style={{ opacity: 0.6 }}>
            No test executed yet
          </p>
        )}

        {result && (
          <div className="metric-grid">

            <div className="metric">
              <div className="metric-title">Success</div>
              <div className="metric-value good">{result.success}</div>
            </div>

            <div className="metric">
              <div className="metric-title">Failures</div>
              <div className="metric-value bad">{result.fail}</div>
            </div>

            <div className="metric">
              <div className="metric-title">Avg Time</div>
              <div className="metric-value">{result.avgResponseTime}</div>
            </div>

            <div className="metric">
              <div className="metric-title">Total Requests</div>
              <div className="metric-value">{result.totalRequests}</div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}