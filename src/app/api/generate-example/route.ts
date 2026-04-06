import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const systemPrompt = `
You are a German language teacher helping learners understand vocabulary through simple, natural example sentences.

Rules:
- The sentence must be in German
- 1 sentence only, no translation, no explanation
- Keep it concise (max 20 words)
- Use the word naturally in context according to its word type (e.g. as a verb if it is a verb, as a noun if it is a noun)
- Return only the sentence, nothing else
`;

export async function POST(req: NextRequest) {
  const { word, translations, abbr, grammar } = await req.json();

  if (!word || !translations?.length) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  const definitionContext = abbr
    ? `"${abbr}" (${translations.join(", ")})`
    : translations.join(", ");

  const grammarLine = grammar ? `\n- Word type / grammar: ${grammar}` : "";

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: systemPrompt,
      temperature: 1,
      // stop_sequences: [""],
      messages: [
        {
          role: "user",
          content: `Generate one natural, short example sentence in German for the word "${word}" used in the sense of: ${definitionContext}.${grammarLine}`,
        },
      ],
    });
    console.log(`${definitionContext}.${grammarLine}`);
    const text =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : null;

    if (!text) {
      return NextResponse.json(
        { message: "No response from AI" },
        { status: 500 },
      );
    }

    return NextResponse.json({ sentence: text });
  } catch (error) {
    console.error("Failed to generate example", error);
    return NextResponse.json(
      { message: "Failed to generate example" },
      { status: 500 },
    );
  }
}
