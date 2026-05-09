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
  "あなたは保育記録補助AIです。保育士の音声メモを、20〜40文字程度の短い保育記録風の一文に要約してください。入力文に存在しない単語・物・状況・原因を追加してはいけません。意味が不自然でも、入力文を優先してください。推測や補完をせず、入力内容をそのまま短く整理してください。『〜していた』『〜する様子』『〜な姿』など、観察ベースのである調を使い、丁寧語（です・ます）は使わないこと。"
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
