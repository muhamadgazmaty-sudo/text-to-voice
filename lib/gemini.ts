import { GoogleGenAI, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export type VoiceType = 'fusha_pro' | 'fusha_storyteller' | 'syrian_abu_saleh' | 'homsi_sara' | 'egyptian_ahmed';

export const generateSpeech = async (text: string, voice: VoiceType) => {
  const ai = getAI();
  
  let prompt = "";
  let voiceName: 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon' | 'Kore' = 'Fenrir';

  if (voice === 'fusha_pro') {
    // National Geographic style: Professional, deep, calm, authoritative Fusha
    prompt = `تحدث باللغة العربية الفصحى بأسلوب وثائقي احترافي، تماماً مثل معلقي ناشيونال جيوغرافيك. الصوت يجب أن يكون عميقاً، هادئاً، وواضح المخارج مع وقفات درامية مناسبة. النص هو: ${text}`;
    voiceName = 'Fenrir'; // Deep voice
  } else if (voice === 'fusha_storyteller') {
    // Distinctive Male Fusha: Eloquent, clear, and resonant
    prompt = `تحدث باللغة العربية الفصحى بأسلوب فصيح ومميز جداً، بنبرة رجل واثق، مخارج الحروف واضحة جداً وأنيقة. الصوت يجب أن يكون رزيناً وفخماً، يعكس جمال اللغة العربية الفصحى بأسلوب أدبي رفيع. النص هو: ${text}`;
    voiceName = 'Zephyr'; // Resonant male voice
  } else if (voice === 'syrian_abu_saleh') {
    // Syrian dialect (Abu Saleh): Authentic Syrian accent, warm and traditional
    prompt = `تحدث باللهجة السورية الشامية الأصيلة، بأسلوب رجل سوري وقور (شخصية أبو صالح)، دافئ وعفوي. استخدم نبرة تعكس الشخصية السورية التقليدية المحببة. النص هو: ${text}`;
    voiceName = 'Charon'; // Warm voice
  } else if (voice === 'homsi_sara') {
    // Homsi dialect (Sara): Authentic Homsi accent, female, friendly and realistic
    prompt = `تحدثي باللهجة الحمصية السورية الأصيلة (لهجة حمص)، بأسلوب فتاة سورية (شخصية سارة)، دافئة وعفوية وواقعية جداً. استخدمي نبرة ومفردات تعكس خفة الدم واللطافة الحمصية المعروفة. النص هو: ${text}`;
    voiceName = 'Kore'; // Female voice
  } else {
    // Egyptian dialect (Ahmed): Friendly, conversational, and authentic Egyptian
    prompt = `تحدث باللهجة المصرية العامية الأصيلة، بأسلوب رجل مصري ودود (شخصية أحمد)، مرح وعفوي وكأنك تدردش مع صديق. استخدم نبرة تعكس خفة الظل المصرية والروح المرحة. النص هو: ${text}`;
    voiceName = 'Puck'; // Friendly, conversational voice
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio content");
  }

  return base64Audio;
};
