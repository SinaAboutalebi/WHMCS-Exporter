const express = require("express");
const { register, collectMetrics } = require("./src/metrics");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9200;

app.get("/metrics", async (req, res) => {
  await collectMetrics();
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  res.send("WHMCS Prometheus Exporter");
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

app.listen(PORT, () => {
  console.log(
    `[🟢] WHMCS Prometheus exporter listening on http://localhost:${PORT}`
  );
});
