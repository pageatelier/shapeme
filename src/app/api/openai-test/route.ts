import OpenAI from "openai";

// Route Handlers only ever run server-side — process.env.OPENAI_API_KEY is
// never bundled into client JS as long as it stays un-prefixed (no
// NEXT_PUBLIC_) and is only read from files like this one.
export async function GET() {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: "'SILUA AI 연결 성공!'이라는 짧은 한국어 문장만 출력해줘.",
    });

    return Response.json({ ok: true, message: response.output_text });
  } catch (error) {
    console.error("[openai-test] request failed:", error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
