// routes/ai.js

const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/translate
router.post("/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Missing text or targetLanguage" });
  }

  try {
    const prompt = `Translate this into ${targetLanguage}: "${text}"`;

    const response = await openai.completions.create({
      model: "gpt-4o-mini",
      prompt,
      max_tokens: 100,
    });

    res.json({ translation: response.choices[0].text.trim() });
  } catch (err) {
    console.error("translate error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/correct
router.post("/correct", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Missing text or language" });
  }

  try {
    const prompt = `Correct the grammar of this ${language} sentence: "${text}"`;

    const response = await openai.completions.create({
      model: "gpt-4o-mini",
      prompt,
      max_tokens: 100,
    });

    res.json({ correction: response.choices[0].text.trim() });
  } catch (err) {
    console.error("correct error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
