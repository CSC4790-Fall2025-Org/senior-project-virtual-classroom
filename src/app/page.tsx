"use client";

import { useState } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";

export default function Home() {
  const [connected, setConnected] = useState(false);

  async function connectAgent() {
    try {
      // 1️⃣ Get ephemeral key from backend
      const res = await fetch("/api/session");
      const data = await res.json();
      const ek = data.value;

      if (!ek) {
        alert("No ephemeral key returned!");
        return;
      }

      // 2️⃣ Create AI student agent
      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions:
          "You are a curious student in a classroom. Respond naturally to the teacher.",
      });

      // 3️⃣ Create session
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
      });

      await session.connect({ apiKey: ek });

(await session.connect({ apiKey: ek }));

// Cast session to any for flexible event handling
(session as any).on("session.created", (event: any) => {
  console.log("✅ Realtime session created:", event);
});

(session as any).on("response", (event: any) => {
  console.log("🤖 AI response event:", event);
});


    } catch (err) {
      console.error("Error connecting voice agent:", err);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Virtual Classroom MVP</h1>

      <button
        onClick={connectAgent}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {connected ? "Connected ✅" : "Connect AI Student"}
      </button>
    </main>
  );
}


