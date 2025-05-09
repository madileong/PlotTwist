const express = require('express');
require('dotenv').config();
console.log("✅ Loaded API key?", process.env.OPENAI_API_KEY ? "YES" : "NO");

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json()); // ✅ Needed for parsing POST body

app.post('/api/completion', async (req, res) => {
  const prompt = req.body.prompt;
  const apiKey = process.env.OPENAI_API_KEY;

  console.log("🧠 Sending request to OpenAI with prompt:", prompt);
  console.log("🔐 API key present:", !!apiKey);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", errorText);
      return res.status(500).json({ error: "API request failed", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: "Unexpected server error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
