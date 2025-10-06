"use client";

import { useState, useRef } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null); // keep session between renders

  async function connectAgent() {
    try {
      // Get ephemeral key from backend
      const res = await fetch("/api/session");
      const data = await res.json();
      const ek = data.value;
      console.log("Ephemeral key:", ek);

      if (!ek) {
        alert("No ephemeral key returned!");
        return;
      }

      // Create AI student agent
      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions: `
          You are a curious, attentive student in a classroom. 
          The user is your teacher, and you should interact with them as a real student would. 
          Behaviors to follow:
          - Answer questions from the teacher directly and briefly.
          - If you don’t understand, politely ask the teacher to clarify.
          - Occasionally ask thoughtful questions to show engagement.
          - Stay respectful and conversational at all times.
          - Do not lecture the teacher; keep your role as a student.
          - Always respond in English, even if the teacher uses another language.
        `,
      });

      // Create session
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
      });

      sessionRef.current = session;

      // Log session creation
      (session as any).on("session.created", (event: any) => {
        console.log("Realtime session created:", event);
      });

      await session.connect({ apiKey: ek });
      setConnected(true);

    } catch (err) {
      console.error("Error connecting voice agent:", err);
    }
  }

  function endCall() {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setConnected(false);
      console.log("Call ended.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-[#183024] to-[#0f1b14] text-white p-8">
      {/* Header */}
      <header className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to The Virtual Classroom</h1>
        <p className="text-lg text-gray-300">
          This is your interactive teaching space. Click the button below to
          start a conversation with your AI student. Speak naturally, and the
          AI will respond in real time.
        </p>
      </header>

      {/* Avatar placeholder */}
      <section
        className={`w-full max-w-md flex items-center justify-center h-48 mb-8 border-4 rounded-lg
        transition-all duration-300 ${
          connected
            ? "border-emerald-400 bg-emerald-900 shadow-[0_0_30px_10px_#22c55e] animate-pulse"
            : "border-gray-600 bg-gray-800 shadow-none"
        }`}
      >
        <img
          src="/avatar.png"
          alt="AI Student Avatar"
          className="h-32 w-32 rounded-full object-cover"
        />
      </section>

      {/* Call-to-action button */}
      <div className="mb-12">
        {!connected ? (
          <button
            onClick={connectAgent}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={endCall}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            ⏹️ End Call
          </button>
        )}
      </div>

      {/* Transcript / Interaction log */}
      <section className="w-full max-w-2xl bg-[#1f3528] rounded-xl shadow-inner p-4 min-h-[150px]">
        <h2 className="text-xl font-semibold mb-2">Transcript</h2>
        <div className="text-gray-300 text-sm">
          <p>Your conversation will appear here...</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto w-full max-w-3xl text-center text-gray-500 text-sm pt-8">
        © {new Date().getFullYear()} Virtual Classroom · Built with Next.js +
        OpenAI Realtime
      </footer>
    </main>
  );
}
