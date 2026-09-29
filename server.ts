import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Emergency keyword patterns
const EMERGENCY_REGEX = /\b(chest pain|crushing chest|heart attack|can't breathe|cannot breathe|severe shortness of breath|gasping for air|sudden numbness|face drooping|facial droop|slurred speech|cannot speak|passed out|loss of consciousness|fainted and won't wake up|uncontrolled bleeding|severe heavy bleeding|coughing up blood)\b/i;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Safe server-side Gemini client
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI client:', err);
    }
  }

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      geminiAvailable: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
      prototype: 'MediBridge AI - Simple Patient Healthcare Assistant',
    });
  });

  // Test n8n Webhook connection
  app.post('/api/n8n/test', async (req: Request, res: Response) => {
    const { webhookUrl, testPayload } = req.body;
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid webhook URL is required.' });
    }

    try {
      const startTime = Date.now();
      const payload = testPayload || {
        event: 'ping_test',
        timestamp: new Date().toISOString(),
        sender: 'MediBridge AI Prototype',
        patientContext: {
          name: 'Eleanor Vance',
          age: 58,
          currentSymptoms: ['Chest tightness when climbing stairs'],
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      const responseText = await response.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { raw: responseText };
      }

      const latencyMs = Date.now() - startTime;

      return res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        response: responseJson,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to reach n8n webhook endpoint',
      });
    }
  });

  // Chat Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    const {
      message,
      conversation = [],
      patientContext,
      n8nConfig,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // 1. Immediate Emergency Check
    if (EMERGENCY_REGEX.test(message)) {
      return res.json({
        text: `⚠️ **This may need urgent medical attention.**\n\nPlease call your local emergency services (such as 911, 112, or 108) or go to the nearest emergency department right away.\n\nDo not wait for an online chat response or a scheduled appointment.`,
        isEmergencyAlert: true,
        routedVia: 'emergency_safety_guard',
        suggestedActions: [
          { label: 'Find Nearest Emergency Center', action: 'book_doctor' },
          { label: 'View Doctor Contacts', action: 'book_doctor' },
        ],
      });
    }

    // 2. n8n custom webhook if enabled
    if (n8nConfig && n8nConfig.isEnabled && n8nConfig.webhookUrl) {
      try {
        const n8nRes = await fetch(n8nConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'patient_message',
            message,
            conversationHistory: conversation,
            patient: patientContext,
            timestamp: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          const replyText =
            n8nData.text ||
            n8nData.response ||
            n8nData.message ||
            (typeof n8nData === 'string' ? n8nData : JSON.stringify(n8nData));

          return res.json({
            text: replyText,
            routedVia: 'n8n_webhook',
            suggestedActions: [
              { label: 'Find a doctor', action: 'book_doctor' },
              { label: 'Book a doctor visit', action: 'view_appointment' },
              { label: 'Check Expected Cost', action: 'view_cost' },
            ],
          });
        }
      } catch (n8nErr) {
        console.warn('n8n webhook call failed, falling back to Gemini / simple engine:', n8nErr);
      }
    }

    // 3. Gemini 3.8 Flash Client
    if (ai) {
      try {
        const systemInstruction = `
You are the MediBridge AI Health Assistant.
Your job is to help ordinary patients, including older adults and people who do not know medical terms, understand their healthcare options in very simple, kind, and everyday language.

RULES YOU MUST FOLLOW:
1. Speak in simple everyday words. Avoid medical jargon. If a term must be mentioned, explain it immediately in plain words (e.g., "Hypertension means high blood pressure").
2. DO NOT DIAGNOSE. DO NOT PRESCRIBE MEDICINE. Always explain that a doctor needs to examine them in person.
3. If the user describes any emergency signs (like sudden chest pressure or trouble breathing), tell them immediately: "This may need urgent medical attention. Please call emergency services or go to the nearest hospital."
4. Keep answers short, clear, and easy to read. Use short bullet points.
5. Offer 1 or 2 clear next steps (like "Book a visit with a heart doctor" or "Check expected costs").

Current Patient Context:
Name: ${patientContext?.name || 'Patient'}
Age: ${patientContext?.age || 'Adult'}
Past health problems: ${patientContext?.medicalHistory ? patientContext.medicalHistory.join(', ') : 'None listed'}
What they are feeling: ${patientContext?.currentSymptoms ? patientContext.currentSymptoms.join(', ') : 'None listed'}
        `;

        const contents: any[] = [];
        if (Array.isArray(conversation)) {
          for (const item of conversation.slice(-6)) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });

        const replyText = geminiRes.text || 'Thank you for your question. A doctor should check your health to give you personalized advice.';
        const suggestedActions = generateSimpleActions(message);

        return res.json({
          text: replyText,
          routedVia: 'gemini_api',
          suggestedActions,
        });
      } catch (geminiError) {
        console.warn('Gemini generateContent error, using fallback:', geminiError);
      }
    }

    // 4. Simple rule-based plain language fallback
    const fallbackResponse = generatePlainLanguageFallback(message, patientContext);
    return res.json({
      text: fallbackResponse.text,
      routedVia: 'simple_rule_engine',
      suggestedActions: fallbackResponse.actions,
    });
  });

  // Lab Summary Endpoint with simple patient-friendly explanation
  app.post('/api/summarize-lab', async (req: Request, res: Response) => {
    const { testName, parameters, patientContext } = req.body;

    if (!testName) {
      return res.status(400).json({ error: 'Test name is required.' });
    }

    const simpleDisclaimer =
      'Doctor Should Check This: This is a simple summary to help you understand your report. It is NOT a medical diagnosis. Please review this with your doctor.';

    if (ai) {
      try {
        const prompt = `
Explain the following medical test result for ${patientContext?.name || 'the patient'} in very simple, plain everyday English that anyone can understand:
Test Name: ${testName}
Results: ${JSON.stringify(parameters, null, 2)}

Instructions:
- Write 2 short, calm paragraphs in simple words.
- Clearly mention which results are within the normal range and which are outside.
- Do NOT make a diagnosis.
- Explain what questions the patient can ask their doctor.
        `;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({
          aiSummary: geminiRes.text,
          clinicalDisclaimer: simpleDisclaimer,
        });
      } catch (e) {
        console.warn('Lab summary Gemini call failed, returning rule-based summary:', e);
      }
    }

    // Default simple summary
    return res.json({
      aiSummary: `Your ${testName} report has been recorded. Some values are within the normal reference range, while others may be slightly higher or lower than typical. Your doctor will review this test during your next visit to advise you on any simple diet or lifestyle steps.`,
      clinicalDisclaimer: simpleDisclaimer,
    });
  });

  // Setup Vite in development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediBridge AI server running on http://localhost:${PORT}`);
  });
}

function generateSimpleActions(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('doctor')) {
    return [
      { label: 'Book a doctor visit', action: 'book_doctor' as const },
      { label: 'Check Expected Cost', action: 'view_cost' as const },
      { label: 'My Health Case', action: 'view_case' as const },
    ];
  }
  if (lower.includes('test') || lower.includes('blood') || lower.includes('report')) {
    return [
      { label: 'Check Medical Tests', action: 'view_test' as const },
      { label: 'My Test Results', action: 'view_test' as const },
    ];
  }
  if (lower.includes('cost') || lower.includes('price') || lower.includes('fee')) {
    return [
      { label: 'Check Expected Cost', action: 'view_cost' as const },
      { label: 'Book a doctor visit', action: 'view_appointment' as const },
    ];
  }
  return [
    { label: 'Find a doctor', action: 'book_doctor' as const },
    { label: 'Book a doctor visit', action: 'view_appointment' as const },
    { label: 'Check Expected Cost', action: 'view_cost' as const },
  ];
}

function generatePlainLanguageFallback(message: string, patientContext: any) {
  const lower = message.toLowerCase();

  if (lower.includes('not feeling well') || lower.includes('symptom') || lower.includes('feeling')) {
    return {
      text: `I am here to help you understand your symptoms and connect you with the right doctor.\n\nCould you tell me:\n1. What are you feeling right now?\n2. How long have you felt this way?\n3. Is it getting better, worse, or staying the same?\n\nIf you have sudden severe chest pain, trouble breathing, or weakness, please call emergency services immediately.`,
      actions: [
        { label: 'Chest tightness when climbing stairs', action: 'set_symptoms' as const },
        { label: 'Find a doctor', action: 'book_doctor' as const },
        { label: 'Check Expected Cost', action: 'view_cost' as const },
      ],
    };
  }

  if (lower.includes('doctor') || lower.includes('specialist')) {
    return {
      text: `We have several certified doctors available for in-person or phone visits:\n\n• **Dr. Sarah Chen** - Heart & Blood Vessels (Cardiology)\n• **Dr. Elena Rodriguez** - General Health & Family Doctor\n• **Dr. David Kim** - Bones & Joints (Orthopedics)\n• **Dr. Marcus Vance** - Brain, Nerves & Headaches\n\nWould you like to book a visit with one of these doctors?`,
      actions: [
        { label: 'Find a doctor', action: 'book_doctor' as const },
        { label: 'Book a doctor visit', action: 'view_appointment' as const },
      ],
    };
  }

  if (lower.includes('cost') || lower.includes('price') || lower.includes('fee')) {
    return {
      text: `Here is a simple look at typical expected costs before insurance:\n\n• **Doctor Visit:** ₹500 (or $140)\n• **Medical Tests:** ₹850 (or $145)\n• **Medicines:** ₹300 (or $24)\n• **Treatment / Procedure:** ₹2,000 (or $290)\n• **Hospital / Day-care room:** ₹1,500 (or $55)\n\n**Total Expected Cost:** ₹5,150\n\n*Note: This is only an estimate. The final cost may be different depending on your insurance.*`,
      actions: [
        { label: 'Check Expected Cost', action: 'view_cost' as const },
        { label: 'Book a doctor visit', action: 'view_appointment' as const },
      ],
    };
  }

  if (lower.includes('test') || lower.includes('lab') || lower.includes('result')) {
    return {
      text: `Medical tests help doctors check your internal health:\n\n• **Cholesterol test:** Checks heart health and blood fats.\n• **Blood sugar test:** Checks for diabetes risk.\n• **ECG:** Traces your heartbeat pattern.\n\nAll test results should be reviewed by your doctor to see what they mean for you.`,
      actions: [
        { label: 'Check Medical Tests', action: 'view_test' as const },
        { label: 'My Test Results', action: 'view_test' as const },
      ],
    };
  }

  if (lower.includes('medicine') || lower.includes('drug') || lower.includes('pill')) {
    return {
      text: `Here are important tips about your medicines:\n\n• Take your medicines at the times your doctor advised.\n• **Generic medicines** have the exact same active medicine as brand names, but cost much less.\n• Never stop or change your medicines without talking to your doctor first.`,
      actions: [
        { label: 'I need help with medicines', action: 'view_medicines' as const },
        { label: 'Find a doctor', action: 'book_doctor' as const },
      ],
    };
  }

  return {
    text: `Hello ${patientContext?.name || ''}! How can I help you today?\n\nYou can ask me to help you find a doctor, understand what tests you might need, check expected costs, or get information on your medicines.\n\nRemember, I provide helpful information to guide you, but a doctor should always check you in person.`,
    actions: [
      { label: 'I am not feeling well', action: 'start_triage_step' as const },
      { label: 'Find a doctor', action: 'book_doctor' as const },
      { label: 'Book a doctor visit', action: 'view_appointment' as const },
      { label: 'Check Expected Cost', action: 'view_cost' as const },
    ],
  };
}

startServer();
