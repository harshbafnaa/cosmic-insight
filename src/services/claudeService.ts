// ============================================================================
// claudeService.ts — CLIENT side.
//
// No API key and no Anthropic SDK live here anymore. Every AI call is a POST to
// the Vercel serverless function at /api/claude, which holds the key
// server-side. If that endpoint is unavailable (running plain `vite dev`
// without functions, key not set, or an error), we transparently fall back to
// deterministic simulated data so the app never crashes.
// ============================================================================
import type {
  KundliAnalysis,
  NumerologyAnalysis,
  NumerologyNumber,
  SoulmateProfile,
  ChatMessage,
  Language,
} from '../types';
import {
  computeCoreNumbers,
  isMaster,
  NUMBER_MEANINGS,
  NUMBER_COLORS,
} from './numerology';

const ENDPOINT = '/api/claude';

/** Result wrapper so the UI knows whether real or simulated data was used. */
export interface ServiceResult<T> {
  data: T;
  simulated: boolean;
}

const DISCLAIMER_EN =
  'This reading is offered for reflection and entertainment. It is not a substitute for professional medical, financial, legal, or relationship advice.';
const DISCLAIMER_HI =
  'यह विश्लेषण आत्म-चिंतन और मनोरंजन हेतु है। यह चिकित्सकीय, वित्तीय, कानूनी या रिश्तों से जुड़ी पेशेवर सलाह का विकल्प नहीं है।';

async function callApi<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`api_${res.status}`);
  return (await res.json()) as T;
}

/** Pings the function so the UI can show "connected" vs "simulated". */
export async function checkClaudeStatus(): Promise<boolean> {
  try {
    const { configured } = await callApi<{ configured: boolean }>({ action: 'status' });
    return Boolean(configured);
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 1) Kundli analysis from an uploaded PDF (Base64).
// ----------------------------------------------------------------------------
export async function analyzeKundli(
  base64Pdf: string,
  lang: Language,
  turnstileToken?: string
): Promise<ServiceResult<KundliAnalysis>> {
  try {
    const data = await callApi<KundliAnalysis>({ action: 'kundli', base64Pdf, lang, turnstileToken });
    return { data, simulated: false };
  } catch (err) {
    console.warn('[claudeService] analyzeKundli falling back to simulation:', err);
    return { data: mockKundli(lang), simulated: true };
  }
}

// ----------------------------------------------------------------------------
// 2) Soulmate profile (text-only — never generates images).
// ----------------------------------------------------------------------------
export async function generateSoulmate(
  kundli: KundliAnalysis,
  lang: Language
): Promise<ServiceResult<SoulmateProfile>> {
  try {
    const data = await callApi<SoulmateProfile>({ action: 'soulmate', kundli, lang });
    return { data, simulated: false };
  } catch (err) {
    console.warn('[claudeService] generateSoulmate falling back to simulation:', err);
    return { data: mockSoulmate(lang), simulated: true };
  }
}

// ----------------------------------------------------------------------------
// 3) Numerology — numbers computed locally (deterministic), AI adds meanings.
// ----------------------------------------------------------------------------
export async function analyzeNumerology(
  fullName: string,
  dob: string,
  lang: Language,
  turnstileToken?: string
): Promise<ServiceResult<NumerologyAnalysis>> {
  const core = computeCoreNumbers(fullName, dob);

  const baseNumbers: NumerologyNumber[] = [
    { key: 'lifePath', label: 'Life Path', value: core.lifePath, isMaster: isMaster(core.lifePath), meaning: '' },
    { key: 'destiny', label: 'Destiny', value: core.destiny, isMaster: isMaster(core.destiny), meaning: '' },
    { key: 'soulUrge', label: 'Soul Urge', value: core.soulUrge, isMaster: isMaster(core.soulUrge), meaning: '' },
    { key: 'personality', label: 'Personality', value: core.personality, isMaster: isMaster(core.personality), meaning: '' },
    { key: 'birthday', label: 'Birthday', value: core.birthday, isMaster: isMaster(core.birthday), meaning: '' },
  ];

  try {
    const out = await callApi<{
      meanings: Record<string, string>;
      summary: string;
      luckyNumbers: number[];
      favorableColors: string[];
    }>({ action: 'numerology', fullName, dob, numbers: baseNumbers, lang, turnstileToken });

    const numbers = baseNumbers.map((n) => ({
      ...n,
      meaning: out.meanings?.[n.key] ?? NUMBER_MEANINGS[n.value] ?? '',
    }));

    return {
      data: {
        fullName,
        dateOfBirth: dob,
        numbers,
        summary: out.summary,
        luckyNumbers: out.luckyNumbers?.length ? out.luckyNumbers : [core.lifePath, core.destiny],
        favorableColors: out.favorableColors?.length ? out.favorableColors : NUMBER_COLORS[core.lifePath] ?? ['Gold'],
      },
      simulated: false,
    };
  } catch (err) {
    console.warn('[claudeService] analyzeNumerology falling back to simulation:', err);
    return { data: mockNumerology(fullName, dob, baseNumbers), simulated: true };
  }
}

// ----------------------------------------------------------------------------
// 4) Chat — lightweight Q&A about the user's report.
// ----------------------------------------------------------------------------
export async function chatWithAdvisor(
  history: ChatMessage[],
  context: string,
  lang: Language
): Promise<string> {
  try {
    const { text } = await callApi<{ text: string }>({ action: 'chat', history, context, lang });
    return text || (lang === 'hi' ? 'क्षमा करें, मैं इसका उत्तर नहीं दे सका।' : 'Sorry, I could not answer that.');
  } catch (err) {
    console.warn('[claudeService] chat unavailable:', err);
    return lang === 'hi'
      ? 'यह एक सिमुलेटेड उत्तर है। लाइव उत्तरों के लिए सर्वर पर ANTHROPIC_API_KEY सेट करें। ' + DISCLAIMER_HI
      : 'This is a simulated reply. Set ANTHROPIC_API_KEY on the server for live answers. ' + DISCLAIMER_EN;
  }
}

// ============================================================================
// Deterministic high-quality MOCK generators (used on any failure / no key).
// ============================================================================
export function mockKundli(lang: Language): KundliAnalysis {
  if (lang === 'hi') {
    return {
      basicDetails: { name: 'नमूना उपयोगकर्ता', dateOfBirth: '14 अगस्त 1995', timeOfBirth: 'सुबह 7:42', placeOfBirth: 'मुंबई, भारत' },
      ascendant: 'सिंह (Leo)',
      moonSign: 'वृश्चिक (Scorpio)',
      sunSign: 'सिंह (Leo)',
      nakshatra: 'अनुराधा',
      doshas: [
        { name: 'मंगल दोष (मांगलिक)', present: true, severity: 'low', description: 'मंगल द्वादश भाव में है, जिसका प्रभाव हल्का है।', remedy: 'मंगलवार को हनुमान चालीसा का पाठ करें।' },
        { name: 'काल सर्प दोष', present: false, severity: 'none', description: 'कुंडली में काल सर्प दोष नहीं है।', remedy: '—' },
      ],
      currentDasha: { mahadasha: 'शुक्र', antardasha: 'बुध', startDate: '2023', endDate: '2026', summary: 'रचनात्मकता और रिश्तों के लिए अनुकूल अवधि।' },
      predictions: [
        { domain: 'Career', outlook: 'नेतृत्व की भूमिकाओं में वृद्धि के संकेत; धैर्य फल देगा।', rating: 4 },
        { domain: 'Wealth', outlook: 'स्थिर संचय; जल्दबाज़ी से बचें।', rating: 3 },
        { domain: 'Love', outlook: 'गहरे भावनात्मक बंधन की संभावना।', rating: 4 },
        { domain: 'Health', outlook: 'समग्र रूप से अच्छा; विश्राम और नींद पर ध्यान दें।', rating: 4 },
      ],
      remedies: [
        { title: 'मोती धारण करें', description: 'चंद्रमा को मजबूत करने हेतु सोमवार को।', category: 'Gemstone' },
        { title: 'गायत्री मंत्र', description: 'प्रतिदिन प्रातः 11 बार जाप।', category: 'Mantra' },
      ],
      summary: 'एक नेतृत्वकारी और भावनात्मक रूप से गहन व्यक्तित्व। ' + DISCLAIMER_HI,
    };
  }
  return {
    basicDetails: { name: 'Sample Seeker', dateOfBirth: '14 August 1995', timeOfBirth: '7:42 AM', placeOfBirth: 'Mumbai, India' },
    ascendant: 'Leo (Simha)',
    moonSign: 'Scorpio (Vrishchik)',
    sunSign: 'Leo (Simha)',
    nakshatra: 'Anuradha',
    doshas: [
      { name: 'Mangal Dosha (Manglik)', present: true, severity: 'low', description: 'Mars sits in the 12th house, giving a mild Manglik influence that softens with age.', remedy: 'Recite Hanuman Chalisa on Tuesdays.' },
      { name: 'Kaal Sarp Dosha', present: false, severity: 'none', description: 'No Kaal Sarp configuration is present in the chart.', remedy: '—' },
    ],
    currentDasha: { mahadasha: 'Venus (Shukra)', antardasha: 'Mercury (Budha)', startDate: '2023', endDate: '2026', summary: 'A creative, relationship-favourable window. Good for partnerships and the arts.' },
    predictions: [
      { domain: 'Career', outlook: 'Movement toward leadership roles. Patience and consistency are rewarded over the next two years.', rating: 4 },
      { domain: 'Wealth', outlook: 'Steady accumulation rather than windfalls. Avoid impulsive speculation.', rating: 3 },
      { domain: 'Love', outlook: 'Potential for a deep, emotionally honest bond. Communication is your strength here.', rating: 4 },
      { domain: 'Health', outlook: 'Generally robust. Prioritise rest, hydration and consistent sleep.', rating: 4 },
    ],
    remedies: [
      { title: 'Wear a Pearl (Moti)', description: 'To strengthen the Moon; ideally set in silver and worn on a Monday.', category: 'Gemstone' },
      { title: 'Gayatri Mantra', description: 'Chant 11 times each morning to support clarity and focus.', category: 'Mantra' },
      { title: 'Donate on Tuesdays', description: 'Offer red lentils or sweets to soften the Mars influence.', category: 'Charity' },
    ],
    summary:
      'A naturally leading, emotionally deep personality blending Leo confidence with Scorpio intensity. The current Venus period favours creativity and relationships. ' +
      DISCLAIMER_EN,
  };
}

export function mockSoulmate(lang: Language): SoulmateProfile {
  if (lang === 'hi') {
    return {
      natureAndPersonality: 'शांत आत्मविश्वास वाला, बौद्धिक रूप से जिज्ञासु और भावनात्मक रूप से स्थिर साथी।',
      coreValues: ['ईमानदारी', 'परिवार', 'विकास', 'करुणा'],
      likelyBackground: 'संभवतः शिक्षा या रचनात्मक क्षेत्र से जुड़ा हुआ।',
      howYouMayMeet: 'किसी साझा रुचि या मित्रों के माध्यम से, अनौपचारिक परिस्थिति में।',
      compatibilityNotes: 'आपकी गहराई उनकी स्थिरता से संतुलित होती है।',
      timingHint: 'शुक्र की अनुकूल अवधि में संभावना प्रबल।',
    };
  }
  return {
    natureAndPersonality:
      'Someone with quiet confidence and genuine warmth — intellectually curious, emotionally steady, and able to hold space for your intensity without being overwhelmed by it.',
    coreValues: ['Honesty', 'Family', 'Personal growth', 'Compassion', 'Loyalty'],
    likelyBackground:
      'Likely from a background that values learning or creativity — possibly in education, design, healthcare or an independent profession.',
    howYouMayMeet:
      'Through a shared interest or a mutual circle rather than a formal setting — a class, a community event, or an introduction by friends.',
    compatibilityNotes:
      'Your emotional depth is balanced by their grounded calm. Friendship is likely to come first, and trust builds steadily.',
    timingHint:
      'Connections are more likely to deepen during favourable Venus periods. Stay open in everyday settings.',
  };
}

export function mockNumerology(
  fullName: string,
  dob: string,
  baseNumbers: NumerologyNumber[]
): NumerologyAnalysis {
  const numbers = baseNumbers.map((n) => ({
    ...n,
    meaning: NUMBER_MEANINGS[n.value] ?? 'A number of balance and learning.',
  }));
  const lp = baseNumbers[0].value;
  return {
    fullName,
    dateOfBirth: dob,
    numbers,
    summary:
      `Your Life Path ${lp} sets the tone of your journey, while your Destiny and Soul Urge numbers reveal how you express and what you most deeply want. ` +
      DISCLAIMER_EN,
    luckyNumbers: [lp, baseNumbers[1].value, baseNumbers[4].value].filter(Boolean),
    favorableColors: NUMBER_COLORS[lp] ?? ['Gold', 'Amber'],
  };
}

export { DISCLAIMER_EN, DISCLAIMER_HI };
