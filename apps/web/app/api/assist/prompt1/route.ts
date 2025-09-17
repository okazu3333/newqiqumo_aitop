import { NextResponse } from "next/server";
import { MockLlmAdapter } from "@/lib/prompt/adapter";
import { Prompt1Schema } from "@/lib/prompt/schemas";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    if (typeof input !== "string") {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const adapter = new MockLlmAdapter();
    const data = await adapter.generatePrompt1(input);
    // Ensure strict schema
    const parsed = Prompt1Schema.parse(data);
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal error" }, { status: 500 });
  }
} 