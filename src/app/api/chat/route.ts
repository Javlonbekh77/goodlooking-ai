import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Xabarlar mavjud emas.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY serverda topilmadi. .env.local faylini tekshiring.',
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60000 } });

    // Format contents for Gemini generateContent
    // Using gemini-2.5-flash which is free and fully working on the user's key!
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Siz "GoodLooking" ilovasining shaxsiy AI sartaroshi va professional erkaklar soch stilistisiz.
Ismingiz: GoodLooking AI Stilist.
Vazifangiz:
- Foydalanuvchilar bilan sof, samimiy, do'stona va zamonaviy o'zbek tilida muloqot qilish.
- Yuz shakli (dumaloq, oval, kvadrat, cho'ziq), soch qalinligi va tuzilishiga qarab eng mos soch turmaklarini (Classic Fade, Textured Crop, Undercut, Buzz Cut, Side Part, Pompadour, Quiff) tavsiya qilish.
- Sartaroshga borishdan oldin qanday tushuntirish kerakligini aytib berish (masalan: "tepasini qaychi bilan, yonlarini 1-2 raqamida taper qiling deng").
- Soch parvarishi, soch to'kilishi, soqol shakli va pomada/mum/vositalar bo'yicha professional maslahatlar berish.
- Foydalanuvchining har qanday savollariga aniq, chiroyli va qiziqarli o'zbekcha javob qaytarish.
- Javoblarni chiroyli formatda (punktlar, emojilar bilan) taqdim eting.`,
      },
      contents: formattedContents,
    });

    const replyText =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Kechirasiz, javob olishda xatolik yuz berdi.';

    return NextResponse.json({
      success: true,
      reply: replyText,
    });
  } catch (err: unknown) {
    console.error('Chat API error:', err);
    const msg = err instanceof Error ? err.message : 'Nomaʼlum xatolik';

    if (msg.includes('API_KEY_INVALID') || msg.includes('403')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API kalitingiz noto‘g‘ri. .env.local faylini tekshiring.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Xatolik: ${msg.slice(0, 150)}`,
      },
      { status: 500 }
    );
  }
}
