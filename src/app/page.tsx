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
      console.log("🔑 Ephemeral key:", ek);

      if (!ek) {
        alert("No ephemeral key returned!");
        return;
      }

      // Create AI student agent
      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions:
          "You are a curious student in a classroom. Always respond in English, even if the teacher speaks another language. Keep your answers short and conversational.",
      });

      // Create session
      // const session = new RealtimeSession(agent, {
      //   model: "gpt-realtime",
      // });

      const session = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
      });

      sessionRef.current = session;

      // Attach events BEFORE connect
      (session as any).on("session.created", (event: any) => {
        console.log("Realtime session created:", event);
        setConnected(true);
      });

      (session as any).on("response", (event: any) => {
        console.log("🤖 AI response event:", event);
      });

      // Now connect
      await session.connect({ apiKey: ek });
    } catch (err) {
      console.error("Error connecting voice agent:", err);
    }
  }

  function endCall() {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setConnected(false);
      console.log("👋 Call ended.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Virtual Classroom MVP</h1>

      {!connected ? (
        <button
          onClick={connectAgent}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Connect AI Student
        </button>
      ) : (
        <button
          onClick={endCall}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          End Call
        </button>
      )}
    </main>
  );
}