import { NextResponse } from "next/server";

export async function GET() {
  const resp = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-realtime",
      },
    }),
  });

const data = await resp.json();
console.log("🔑 OpenAI response:", data);
return NextResponse.json(data);
}
