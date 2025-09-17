import { NextResponse } from "next/server";
import { MockLlmAdapter } from "@/lib/prompt/adapter";
import { Prompt1Schema, Prompt2Schema } from "@/lib/prompt/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt1 = Prompt1Schema.parse(body);
    const adapter = new MockLlmAdapter();
    const data = await adapter.generatePrompt2(prompt1);
    const parsed = Prompt2Schema.parse(data);
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal error" }, { status: 500 });
  }
} 