const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = "https://getdl.space";
const API_ENDPOINT = `${BASE_URL}/api/download`;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
  "Referer": `${BASE_URL}/id`,
  "Origin": BASE_URL,
  "Content-Type": "application/json",
  "Accept": "application/json, text/plain, */*",
  "Cookie": "NEXT_LOCALE=id"
};

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/download", async (req, res) => {
  const targetUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";

  if (!targetUrl) {
    return res.status(400).json({ error: "URL wajib diisi." });
  }

  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: "Format URL tidak valid." });
  }

  try {
    const response = await axios.post(
      API_ENDPOINT,
      { url: targetUrl },
      {
        headers: HEADERS,
        responseType: "json",
        timeout: 30000,
        validateStatus: () => true
      }
    );

    if (response.status >= 400) {
      return res.status(response.status).json({
        error: "API downloader mengembalikan error.",
        status_code: response.status,
        details: response.data
      });
    }

    return res.json({
      status_code: response.status,
      metadata: response.data
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    return res.status(502).json({
      error: "Gagal menghubungi API downloader.",
      details: error.message
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`GetDL Web berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;