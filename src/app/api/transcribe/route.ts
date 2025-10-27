import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ text: "No audio file provided" }, { status: 400 });
    }

    // Convert Blob to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use fetch with multipart/form-data manually
    const form = new FormData();
    form.append("file", new Blob([buffer]), "recording.webm");
    form.append("model", "whisper-1");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form as any, // Node fetch needs a type cast
    });

    const data = await resp.json();
    return NextResponse.json({ text: data.text ?? "Transcription failed" });
  } catch (err: any) {
    console.error("Error in /api/transcribe:", err);
    return NextResponse.json({ text: "Transcription error" }, { status: 500 });
  }
}
