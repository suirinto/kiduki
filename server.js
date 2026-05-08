const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

    const fs = require("fs");
    const path = require("path");

    const tempFilePath = path.join(__dirname, "temp.webm");

    fs.writeFileSync(tempFilePath, req.file.buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "ja"
    });

    fs.unlinkSync(tempFilePath);

    console.log(transcription.text);

const summaryResponse = await openai.chat.completions.create({
  model: "gpt-4.1-mini",
  messages: [
    {
      role: "system",
      content:
        "あなたは保育記録補助AIです。保育士の音声メモを、短く自然な保育記録風の一文に要約してください。20文字〜40文字程度。断定しすぎず、観察表現を使ってください。"
    },
    {
      role: "user",
      content: transcription.text
    }
  ]
});

const summary =
  summaryResponse.choices[0].message.content;

console.log(summary);

res.json({
  ok: true,
  transcript: transcription.text,
  summary: summary
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
