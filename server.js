const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const upload = multer();

app.use(express.static(__dirname));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    console.log("audio received");

    if (!req.file) {
      return res.status(400).json({
        error: "No audio file"
      });
    }

    console.log(req.file);

    res.json({
      ok: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
