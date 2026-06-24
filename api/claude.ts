// ============================================================================
// /api/claude.ts — Vercel serverless function (the ONLY place the key is used).
//
// Since the app has no user login, the paid Claude endpoint is protected by
// THREE layered, defense-in-depth guards (each optional via env, all best
// turned on for a public deployment):
//
//   1. Origin allowlist   (ALLOWED_ORIGIN)        — blocks other sites' browsers
//   2. Rate limiting       (UPSTASH_* or in-mem)   — caps requests per IP
//   3. Proof-of-human       (TURNSTILE_SECRET_KEY)  — blocks bots on paid calls
//
// The Anthropic key (ANTHROPIC_API_KEY) has NO VITE_ prefix, so it is never
// shipped to the browser.
// ============================================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

export const config = { maxDuration: 60 };

const MODEL_MAIN = 'claude-sonnet-4-6';
const MODEL_CHAT = 'claude-haiku-4-5-20251001';

const apiKey = process.env.ANTHROPIC_API_KEY;

type Language = 'en' | 'hi';
const langInstruction = (lang: Language) =>
  lang === 'hi'
    ? 'Respond entirely in Hindi (Devanagari script). All string field values must be in Hindi.'
    : 'Respond entirely in English.';

// ---------------------------------------------------------------------------
// GUARDS
// ---------------------------------------------------------------------------
function clientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  return (raw?.split(',')[0] || (req.headers['x-real-ip'] as string) || 'unknown').trim();
}

function originAllowed(req: VercelRequest): boolean {
  const allowed = process.env.ALLOWED_ORIGIN; // e.g. https://your-app.vercel.app
  if (!allowed) return true; // not enforced until you set it
  const origin = req.headers.origin;
  if (!origin) return false;
  if (origin.startsWith('http://localhost')) return true;
  return origin === allowed;
}

// Rate limit: durable via Upstash Redis REST if configured, else best-effort
// in-memory (resets per cold start / per region — fine for light protection).
const RL_LIMIT = Number(process.env.RATE_LIMIT_MAX ?? 20);
const RL_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? 600);
const memBuckets = new Map<string, { count: number; reset: number }>();

async function rateLimitOk(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const bucket = Math.floor(Date.now() / (RL_WINDOW * 1000));
      const key = `rl:${ip}:${bucket}`;
      const r = await fetch(`${url}/incr/${key}`, { headers: { Authorization: `Bearer ${token}` } });
      const { result } = (await r.json()) as { result: number };
      if (result === 1) {
        await fetch(`${url}/expire/${key}/${RL_WINDOW}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      return result <= RL_LIMIT;
    } catch {
      return true; // never hard-fail on the limiter being down
    }
  }
  const now = Date.now();
  const e = memBuckets.get(ip);
  if (!e || now > e.reset) {
    memBuckets.set(ip, { count: 1, reset: now + RL_WINDOW * 1000 });
    return true;
  }
  e.count += 1;
  return e.count <= RL_LIMIT;
}

async function turnstileOk(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not enforced
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (ip && ip !== 'unknown') form.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const d = (await r.json()) as { success: boolean };
    return Boolean(d.success);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// TOOL SCHEMAS (force strictly-typed JSON output)
// ---------------------------------------------------------------------------
const kundliTool: Anthropic.Tool = {
  name: 'record_kundli_analysis',
  description: 'Record the complete structured Vedic astrology (Kundli) analysis.',
  input_schema: {
    type: 'object',
    properties: {
      basicDetails: {
        type: 'object',
        properties: {
          name: { type: 'string' }, dateOfBirth: { type: 'string' },
          timeOfBirth: { type: 'string' }, placeOfBirth: { type: 'string' },
        },
        required: ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
      },
      ascendant: { type: 'string' }, moonSign: { type: 'string' },
      sunSign: { type: 'string' }, nakshatra: { type: 'string' },
      doshas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' }, present: { type: 'boolean' },
            severity: { type: 'string', enum: ['none', 'low', 'moderate', 'high'] },
            description: { type: 'string' }, remedy: { type: 'string' },
          },
          required: ['name', 'present', 'severity', 'description', 'remedy'],
        },
      },
      currentDasha: {
        type: 'object',
        properties: {
          mahadasha: { type: 'string' }, antardasha: { type: 'string' },
          startDate: { type: 'string' }, endDate: { type: 'string' }, summary: { type: 'string' },
        },
        required: ['mahadasha', 'antardasha', 'startDate', 'endDate', 'summary'],
      },
      predictions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domain: { type: 'string', enum: ['Career', 'Wealth', 'Love', 'Health'] },
            outlook: { type: 'string' }, rating: { type: 'integer', minimum: 1, maximum: 5 },
          },
          required: ['domain', 'outlook', 'rating'],
        },
      },
      remedies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' }, description: { type: 'string' },
            category: { type: 'string', enum: ['Gemstone', 'Mantra', 'Ritual', 'Lifestyle', 'Charity'] },
          },
          required: ['title', 'description', 'category'],
        },
      },
      summary: { type: 'string' },
    },
    required: [
      'basicDetails', 'ascendant', 'moonSign', 'sunSign', 'nakshatra',
      'doshas', 'currentDasha', 'predictions', 'remedies', 'summary',
    ],
  },
};

const soulmateTool: Anthropic.Tool = {
  name: 'record_soulmate_profile',
  description: 'Record a text-only descriptive soulmate personality & compatibility profile.',
  input_schema: {
    type: 'object',
    properties: {
      natureAndPersonality: { type: 'string' },
      coreValues: { type: 'array', items: { type: 'string' } },
      likelyBackground: { type: 'string' }, howYouMayMeet: { type: 'string' },
      compatibilityNotes: { type: 'string' }, timingHint: { type: 'string' },
    },
    required: [
      'natureAndPersonality', 'coreValues', 'likelyBackground',
      'howYouMayMeet', 'compatibilityNotes', 'timingHint',
    ],
  },
};

const numerologyTool: Anthropic.Tool = {
  name: 'record_numerology_meanings',
  description: 'Provide narrative meanings for pre-computed numerology numbers plus an overall summary.',
  input_schema: {
    type: 'object',
    properties: {
      meanings: {
        type: 'object',
        properties: {
          lifePath: { type: 'string' }, destiny: { type: 'string' }, soulUrge: { type: 'string' },
          personality: { type: 'string' }, birthday: { type: 'string' },
        },
        required: ['lifePath', 'destiny', 'soulUrge', 'personality', 'birthday'],
      },
      summary: { type: 'string' },
      luckyNumbers: { type: 'array', items: { type: 'integer' } },
      favorableColors: { type: 'array', items: { type: 'string' } },
    },
    required: ['meanings', 'summary', 'luckyNumbers', 'favorableColors'],
  },
};

function extractToolInput<T>(msg: Anthropic.Message, toolName: string): T {
  const block = msg.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === toolName
  );
  if (!block) throw new Error(`Model did not return tool "${toolName}"`);
  return block.input as T;
}

// ---------------------------------------------------------------------------
// HANDLER
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
  const action = body.action as string;
  const lang: Language = body.lang === 'hi' ? 'hi' : 'en';

  // Status ping bypasses guards (cheap, reveals nothing but a boolean).
  if (action === 'status') return res.status(200).json({ configured: Boolean(apiKey) });

  // --- Guard 1: origin ---
  if (!originAllowed(req)) return res.status(403).json({ error: 'forbidden_origin' });

  // --- Guard 2: rate limit ---
  const ip = clientIp(req);
  if (!(await rateLimitOk(ip))) return res.status(429).json({ error: 'rate_limited' });

  // --- Guard 3: proof-of-human for the expensive entry-point actions ---
  if (action === 'kundli' || action === 'numerology') {
    if (!(await turnstileOk(body.turnstileToken, ip))) {
      return res.status(403).json({ error: 'verification_failed' });
    }
  }

  if (!apiKey) return res.status(503).json({ error: 'not_configured' });
  const client = new Anthropic({ apiKey });

  try {
    if (action === 'kundli') {
      const system =
        'You are an expert Vedic astrologer (Jyotish) with deep knowledge of parashari ' +
        'astrology, dashas, doshas and remedial measures. You read the attached Kundli / ' +
        'birth-chart PDF natively and produce a thorough, compassionate and responsible ' +
        'reading. Frame predictions as guidance for reflection, never as medical, financial ' +
        'or legal certainties. ' + langInstruction(lang) +
        ' Always call the record_kundli_analysis tool with your full analysis.';
      const msg = await client.messages.create({
        model: MODEL_MAIN, max_tokens: 4096, system,
        tools: [kundliTool], tool_choice: { type: 'tool', name: kundliTool.name },
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: body.base64Pdf } },
            { type: 'text', text:
              'Analyze this Kundli PDF in full. Extract the basic birth details, determine ' +
              'ascendant (Lagna), Moon sign, Sun sign and Nakshatra, identify any major doshas ' +
              '(Mangal/Manglik, Kaal Sarp, etc.) with severity, state the current Mahadasha/' +
              'Antardasha, give predictions for Career, Wealth, Love and Health (each rated 1-5), ' +
              'and suggest personalized remedies.' },
          ],
        }],
      });
      return res.status(200).json(extractToolInput(msg, kundliTool.name));
    }

    if (action === 'soulmate') {
      const k = body.kundli;
      const system =
        'You are an expert Vedic astrologer specializing in relationship and 7th-house ' +
        'analysis. Based on the provided chart summary, describe the likely NATURE, VALUES and ' +
        'CHARACTERISTICS of the person’s soulmate in words only. Never describe physical ' +
        'appearance in a way that identifies a real person, and never produce images. Keep it ' +
        'warm, grounded and non-deterministic. ' + langInstruction(lang) +
        ' Call the record_soulmate_profile tool.';
      const msg = await client.messages.create({
        model: MODEL_MAIN, max_tokens: 1500, system,
        tools: [soulmateTool], tool_choice: { type: 'tool', name: soulmateTool.name },
        messages: [{
          role: 'user',
          content:
            `Chart context:\nAscendant: ${k?.ascendant}\nMoon sign: ${k?.moonSign}\n` +
            `Sun sign: ${k?.sunSign}\nNakshatra: ${k?.nakshatra}\nOverall: ${k?.summary}\n\n` +
            `Describe their soulmate's traits and how they may meet.`,
        }],
      });
      return res.status(200).json(extractToolInput(msg, soulmateTool.name));
    }

    if (action === 'numerology') {
      const { fullName, dob, numbers } = body;
      const system =
        'You are an expert numerologist. The core numbers have ALREADY been calculated for you ' +
        '— do not recompute them. Provide a rich, personalized meaning for each, an overall ' +
        'summary, lucky numbers and favorable colors. ' + langInstruction(lang) +
        ' Call the record_numerology_meanings tool.';
      const msg = await client.messages.create({
        model: MODEL_MAIN, max_tokens: 2000, system,
        tools: [numerologyTool], tool_choice: { type: 'tool', name: numerologyTool.name },
        messages: [{
          role: 'user',
          content:
            `Name: ${fullName}\nDate of birth: ${dob}\n\nCore numbers:\n` +
            (numbers ?? [])
              .map((n: { label: string; value: number; isMaster: boolean }) =>
                `- ${n.label}: ${n.value}${n.isMaster ? ' (master)' : ''}`)
              .join('\n') + `\n\nWrite meanings tailored to this person.`,
        }],
      });
      return res.status(200).json(extractToolInput(msg, numerologyTool.name));
    }

    if (action === 'chat') {
      const { history, context } = body;
      const system =
        'You are CosmicInsight’s friendly Vedic astrology & numerology advisor. Answer the ' +
        'user’s questions about their report clearly and kindly. Keep answers concise (2-4 ' +
        'short paragraphs). Encourage real professional help for medical, legal or financial ' +
        'matters. ' + langInstruction(lang) + `\n\nUser's report context:\n${context ?? ''}`;
      const msg = await client.messages.create({
        model: MODEL_CHAT, max_tokens: 1024, system,
        messages: (history ?? []).map((m: { role: 'user' | 'assistant'; content: string }) => ({
          role: m.role, content: m.content,
        })),
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text).join('\n').trim();
      return res.status(200).json({ text });
    }

    return res.status(400).json({ error: 'unknown_action' });
  } catch (err) {
    console.error('[api/claude] error:', err);
    return res.status(500).json({ error: 'anthropic_error' });
  }
}
