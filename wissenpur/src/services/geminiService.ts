import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { Question, CategoryId, Difficulty } from "../types";

let ai: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using fallback questions.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const generateQuestions = async (
  category: string,
  difficulty: Difficulty | 'all',
  count: number = 10
): Promise<Question[] | null> => {
  const client = getGeminiClient();
  if (!client) return null;

  const difficultyName = difficulty === 'all' ? 'gemischt' : difficulty;
  const seed = Math.floor(Math.random() * 1000000);

  let prompt = `Erstelle GENAU ${count} Karteikarten/Quizfragen auf Deutsch für das Thema "${category}" mit dem Schwierigkeitsgrad "${difficultyName}".
Jede Frage muss 4 Optionen haben und einen korrekten Index (0-3). Antworte NUR mit dem JSON-Array.
WICHTIG: Erstelle abwechslungsreiche, interessante Fragen.
ZUSÄTZLICH: Erstelle für JEDE Frage ein Feld 'imagePrompt'. Das muss ein kurzer, prägnanter englischer Prompt sein, der das Thema der Frage beschreibt (z.B. "A photorealistic image of a golden retriever", "A colorful 3d illustration of a human brain").
Jede Frage muss absolut einzigartig und faktisch korrekt sein. Sei kreativ!
Zufalls-Seed für Variation: ${seed}`;

  if (category === 'Flaggen erraten') {
    prompt += `\n\nFÜR FLAGGEN-FRAGEN: Gib zusätzlich ein Feld 'countryCode' (ISO 3166-1 alpha-2, kleingeschrieben, z.B. 'de', 'us', 'fr') an, das die Flagge repräsentiert, die erraten werden soll. Die Frage sollte lauten "Zu welchem Land gehört diese Flagge?".`;
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              correctAnswer: {
                type: Type.INTEGER,
              },
              explanation: {
                type: Type.STRING,
              },
              countryCode: {
                type: Type.STRING,
              },
              imagePrompt: {
                type: Type.STRING,
              },
            },
            required: ["question", "options", "correctAnswer", "imagePrompt"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    
    // Map to our Question type
    return parsed.map((q: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: category === 'all' ? 'allgemein' : category,
      difficulty: difficulty === 'all' ? 'mittel' : difficulty,
      explanation: q.explanation || "Keine Erklärung verfügbar.",
      imagePrompt: q.imagePrompt,
      imageUrl: q.countryCode 
        ? `https://flagcdn.com/w320/${q.countryCode.toLowerCase()}.png` 
        : (q.imagePrompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(q.imagePrompt)}?width=800&height=600&nologo=true` : undefined),
    }));
  } catch (error) {
    console.error("Error generating questions:", error);
    return null;
  }
};
