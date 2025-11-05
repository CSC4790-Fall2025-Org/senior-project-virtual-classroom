import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "missing transcript" }, { status: 400 });
    }

    const prompt = `
You are evaluating the *teacher* based on what happened in this transcript.

Write ONE short natural paragraph (4–7 sentences) describing the quality of teaching.
Be honest but constructive. No bullet points. No rubric. No scores.

Transcript of lesson:
"${transcript}"
`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // cheap + good for this
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();

    const report = data.choices?.[0]?.message?.content ?? "report generation failed";

    return NextResponse.json({ report });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
