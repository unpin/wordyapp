import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const systemPrompt = `
You are a German language teacher helping learners learn language and answering their questions. Reply shortly.
`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  console.log("msgs", messages);

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: systemPrompt,
      temperature: 1,
      // stop_sequences: [""],
      messages,
    });

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

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Failed to generate example", error);
    return NextResponse.json(
      { message: "Failed to generate example" },
      { status: 500 },
    );
  }
}
