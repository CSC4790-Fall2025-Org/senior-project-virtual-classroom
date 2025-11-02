"use client";
import { useState, useRef } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // ==========================
  // Connect to the realtime agent
  // ==========================
  async function connectAgent() {
    try {
      // Start recording immediately
      await startRecording();

      // Get ephemeral key from backend
      const res = await fetch("/api/session");
      const data = await res.json();
      const ek = data.value;
      if (!ek) {
        alert("No ephemeral key returned!");
        return;
      }

      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions: `
          You are a curious, attentive student in a classroom. 
          Answer questions directly, stay respectful, converse naturally.
        `,
      });

      const session = new RealtimeSession(agent, { model: "gpt-realtime" });
      sessionRef.current = session;

      (session as any).on("session.created", (event: any) => {
        console.log("Realtime session created:", event);
      });

      await session.connect({ apiKey: ek });
      setConnected(true);
    } catch (err) {
      console.error("Error connecting voice agent:", err);
    }
  }

  // ==========================
  // End call
  // ==========================
  function endCall() {
    stopRecording();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setConnected(false);
      console.log("Call ended.");
    }
  }

  // ==========================
  // Recording logic
  // ==========================
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setRecordings((prev) => [...prev, blob]);

      // ✅ After call ends: transcribe + generate report
      const transcript = await transcribeAudio(blob);
      setTranscripts((prev) => [...prev, transcript]);

      const report = await generateReport(transcript);
      setReports((prev) => [...prev, report]);
    };

    mediaRecorder.start();
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }

  // ==========================
  // Send recording to backend for transcription
  // ==========================
  async function transcribeAudio(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob, "lesson.webm");

    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();
    return data.text ?? "Transcription failed";
  }

  // ==========================
  // Send transcript to backend for AI evaluation report
  // ==========================
  async function generateReport(transcript: string) {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = await res.json();
    return data.report ?? "Failed to generate report";
  }

  // ==========================
  // UI
  // ==========================
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-[#183024] to-[#0f1b14] text-white p-16">
      <header className="w-full max-w-3xl text-center mb-16">
        <h1 className="text-8xl font-bold mb-4">Welcome to The Virtual Classroom</h1>
        <p className="text-2xl text-gray-300">
          Start a conversation with your AI student. Speak naturally, and the AI will respond.
        </p>
      </header>

      <section
        className={`w-full max-w-md flex items-center justify-center h-96 mb-16 border-8 rounded-lg
        transition-all duration-300 ${
          connected
            ? "border-emerald-400 bg-emerald-900 shadow-[0_0_60px_20px_#22c55e] animate-pulse"
            : "border-gray-600 bg-gray-800 shadow-none"
        }`}
      >
        <img
          src="/avatar.png"
          alt="AI Student Avatar"
          className="h-64 w-64 rounded-full object-cover"
        />
      </section>

      <div className="mb-16">
        {!connected ? (
          <button
            onClick={connectAgent}
            className="px-16 py-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition text-4xl"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={endCall}
            className="px-16 py-8 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition text-4xl"
          >
            ⏹️ End Call
          </button>
        )}
      </div>

      <section className="w-full max-w-2xl bg-[#1f3528] rounded-xl shadow-inner p-8 min-h-[300px]">
        <h2 className="text-2xl font-semibold mb-4">Transcript</h2>
        <div className="text-gray-300 text-xl mb-6">
          {transcripts.length === 0 && <p>Your conversation will appear here...</p>}
          {transcripts.map((t, i) => (
            <p key={i} className="mb-2">{t}</p>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Student Reports</h2>
        <div className="flex flex-col gap-4">
          {reports.length === 0 && <p>No reports yet...</p>}
          {reports.map((r, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-md">{r}</div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Recordings</h2>
        <div className="flex flex-col gap-4">
          {recordings.map((r, i) => (
            <audio key={i} controls src={URL.createObjectURL(r)} className="w-full" />
          ))}
        </div>
      </section>

      <footer className="mt-auto w-full max-w-3xl text-center text-gray-500 text-xl pt-8">
        © {new Date().getFullYear()} Virtual Classroom · Built with Next.js + OpenAI Realtime
      </footer>
    </main>
  );
}
