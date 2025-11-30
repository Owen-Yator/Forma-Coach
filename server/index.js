import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const DATA_PATH = path.resolve('./server/data.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

async function readData() {
  try {
    const txt = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return { history: [], plans: [] };
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function coachTool(activityText) {
  // Server-side coach tool. Uses Google GenAI if API_KEY is present, otherwise returns a helpful fallback.
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
  if (!apiKey) {
    // simple fallback
    const summary = `Quick coaching for: ${activityText.split('\n')[0].slice(0,120)}`;
    return {
      summary,
      confidence: 0.6,
      suggestions: ['Keep consistent: 3x/week', 'Increase load gradually (≈10% per week)'],
      plan: ['5 min warm-up', 'Main set at moderate intensity', '5 min cool-down + stretch'],
      workouts: ['Routine A: squats, push-ups, rows — 3 sets of 8-12 reps', 'Routine B: 20 min interval cardio'],
      meals: ['Protein + carbs within 2h post-workout (chicken + rice)', 'Light snack 30-60m before (banana)'],
      recovery: ['Foam roll 5-10m', 'Prioritize 7-9h sleep']
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are FORMA Coach, an empathetic AI fitness coach. The user provides an activity log and profile details. Produce a concise JSON response with the following keys:\n- summary: one-sentence summary\n- confidence: number between 0 and 1\n- suggestions: array of 3-6 short, prioritized tips\n- plan: array of 3-6 actionable steps\n- workouts: array of 1-3 short workout routines tailored to the user's fitness level and goal\n- meals: array of 1-3 post/pre-workout meal suggestions (brief)\n- recovery: array of 2-4 post-workout recovery routines\n\nBe specific, concise, and encouraging. Use the input below to tailor recommendations. Output MUST be strict JSON parsable without extra commentary. Input:\n${activityText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json', temperature: 0.2 }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (err) {
    console.error('coachTool error', err);
  }

  return {
    summary: 'Sorry — could not generate coaching right now.',
    confidence: 0,
    suggestions: [],
    plan: [],
    workouts: [],
    meals: [],
    recovery: []
  };
}

app.post('/api/agent/act', async (req, res) => {
  try {
    const payload = req.body;
    const activityText = payload.text || JSON.stringify(payload.input || payload);
    const coaching = await coachTool(activityText);

    // persist history entry
    const data = await readData();
    const entry = { id: `srv_${Date.now()}`, timestamp: Date.now(), input: payload, coaching };
    data.history.unshift(entry);
    await writeData(data);

    res.json({ ok: true, coaching, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/api/agent/history', async (req, res) => {
  const data = await readData();
  res.json({ ok: true, history: data.history });
});

app.post('/api/agent/plan', async (req, res) => {
  const plan = req.body;
  const data = await readData();
  data.plans.unshift(plan);
  await writeData(data);
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`ADK-style agent server listening on http://localhost:${port}`));
