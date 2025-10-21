// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI APIキー（ここに自分のキーを入力）
const configuration = new Configuration({
  apiKey: 'YOUR_OPENAI_API_KEY', // ← 必ず自分のAPIキーをここに
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // index.html を配信

// wool-AIのチャットエンドポイント
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4', // 重いなら 'gpt-3.5-turbo' でもOK
      messages: [
        {
          role: 'system',
          content: 'あなたは wool-AI という名前の、やさしくて親しみやすい広島弁を話すAIチャットボットです。語尾に「〜じゃけぇ」「〜なんよ」「〜しとるよ」などを自然に使って、かわいく楽しく会話してください。',
        },
        { role: 'user', content: message },
      ],
    });
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'エラーが起きたんよ〜。ごめんね〜。' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 wool-AI サーバー起動中：http://localhost:${PORT}`);
});
