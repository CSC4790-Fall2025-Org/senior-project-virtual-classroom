"use client";

import { useState, useRef, useEffect } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../login/firebase";

const db = getFirestore(app);
const auth = getAuth(app);

export default function Home() {
  const [connected, setConnected] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [user, setUser] = useState<any>(null);
  const [studentGrade, setStudentGrade] = useState<string>("");
  const [studentLanguage, setStudentLanguage] = useState<string>("English");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ==========================
  // Load current user + Firestore data
  // ==========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentGrade(data.studentGrade || "");
          setStudentLanguage(data.language || "English");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ==========================
  // Helper: choose AI behavior based on grade + language
  // ==========================
  function getStudentInstructions(grade: string, language: string) {
    const langPrefix = language !== "English" ? `Respond in ${language}. ` : "";

    switch (grade) {
      case "Elementary":
        return `
          ${langPrefix}
          You are an enthusiastic elementary school student, and the user is your teacher.
          Speak simply, use short sentences, and show lots of curiosity.
          Ask basic "why" or "how" questions and show excitement to learn.
          If something confuses you, say so kindly.
          Keep your answers positive and brief.
        `;
      case "Middle":
        return `
          ${langPrefix}
          You are a middle school student, and the user is your teacher.
          You're curious but sometimes unsure.
          Ask good questions and think out loud when problem solving.
          Keep your responses conversational, clear, and honest.
        `;
      case "High":
        return `
          ${langPrefix}
          You are a high school student, and the user is your teacher.
          Speak respectfully and think critically.
          Engage with ideas thoughtfully, give short but reasoned answers.
          Ask deeper questions occasionally, but stay humble as a learner.
        `;
      case "College":
        return `
          ${langPrefix}
          You are a college student, and the user is your teacher.
          Be articulate and analytical but still conversational.
          Respond with clear reasoning and curiosity.
          Occasionally challenge ideas politely or connect them to broader topics.
        `;
      default:
        return `
          ${langPrefix}
          You are a curious, attentive student.
          The user is your teacher, and you should interact with them as a real student would.
          Behaviors to follow:
          - Answer questions from the teacher directly and briefly.
          - If you don’t understand, politely ask the teacher to clarify.
          - Occasionally ask thoughtful questions to show engagement.
          - Stay respectful and conversational at all times.
          - Do not lecture the teacher; keep your role as a student.
        `;
    }
  }

  // ==========================
  // Connect to the realtime agent
  // ==========================
  async function connectAgent() {
    try {
      await startRecording();

      const res = await fetch("/api/session");
      const data = await res.json();
      const ek = data.value;
      if (!ek) {
        alert("No ephemeral key returned!");
        return;
      }

      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions: getStudentInstructions(studentGrade, studentLanguage),
        voice: "echo",
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
      setRecordings([blob]);

      const transcript = await transcribeAudio(blob);
      setTranscripts([transcript]);

      const report = await generateReport(transcript);
      setReports([report]);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
  }

  function pauseOrResumeRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
    }
  }

  // ==========================
  // Transcribe and generate report
  // ==========================
  async function transcribeAudio(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob, "lesson.webm");

    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();
    return data.text ?? "Transcription failed";
  }

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
  // Render
  // ==========================
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAF8] text-[#1F2933] p-10">
      <div className="mb-8 text-center">
        <section className="bg-[#E6F0E6] p-6 rounded-2xl shadow-md border border-[#C8D8C4] mb-10">
          <h1 className="text-4xl font-bold text-[#2F4633] mb-2">Virtual Classroom</h1>
          <p className="text-lg text-[#5A5A5A]">
            Click "Start Recording" to begin a session with your AI student. Speak as you would in a real classroom, and the AI will respond accordingly. After you finish, you'll receive a transcript and an evaluation report of your teaching! 
            Press "Save Lesson" to store your session for future review.
          </p>
        </section>
      </div>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">
        {/* ================= Left Panel ================= */}
        <section className="flex-1 bg-[#E6F0E6] rounded-2xl shadow-md border border-[#C8D8C4] p-8 flex flex-col items-center">
          <header className="w-full text-center mb-8">
            {studentGrade && (
              <p className="text-lg text-[#4C7153] font-medium">
                🎓 Current Level: {studentGrade} | 🌐 Language: {studentLanguage}
              </p>
            )}
          </header>

          <div
            className={`w-56 h-56 mb-8 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
              connected
                ? "border-[#6DA77A] bg-[#DDF3DF] shadow-[0_0_25px_3px_#6DA77A] animate-pulse"
                : "border-[#C8D8C4] bg-[#F4F7F4]"
            }`}
          >
            <img
              src="/avatar.png"
              alt="AI Student Avatar"
              className="h-40 w-40 rounded-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            {!isRecording && !connected ? (
              <button
                onClick={async () => {
                  await startRecording();
                  await connectAgent();
                }}
                className="px-8 py-4 bg-[#4C7153] hover:bg-[#3E5D45] text-white font-semibold rounded-xl shadow-sm transition text-xl"
              >
                🎤 Start Recording
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={pauseOrResumeRecording}
                  className={`px-6 py-3 ${
                    isPaused
                      ? "bg-[#A7A7A7] hover:bg-[#909090]"
                      : "bg-[#E6C84E] hover:bg-[#D4B83F]"
                  } text-white font-semibold rounded-lg shadow-sm transition text-lg`}
                >
                  {isPaused ? "▶️ Resume" : "⏸️ Pause"}
                </button>

                <button
                  onClick={() => {
                    stopRecording();
                    if (sessionRef.current) {
                      sessionRef.current.close();
                      sessionRef.current = null;
                      setConnected(false);
                    }
                    setIsRecording(false);
                    setIsPaused(false);
                  }}
                  className="px-6 py-3 bg-[#D65555] hover:bg-[#C44C4C] text-white font-semibold rounded-lg shadow-sm transition text-lg"
                >
                  ⏹️ Stop
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= Right Panel ================= */}
        <section className="flex-[1.5] bg-[#E6F0E6] rounded-2xl shadow-md border border-[#C8D8C4] p-8 overflow-y-auto max-h-[80vh]">
          {/* Transcript */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b border-[#6DA77A] pb-1">
              Transcript
            </h2>
            <div className="text-[#444] text-base space-y-2">
              {transcripts.length === 0 ? (
                <p className="italic text-[#9B9B9B]">
                  Your conversation will appear here...
                </p>
              ) : (
                transcripts.map((t, i) => (
                  <p key={i} className="leading-relaxed">{t}</p>
                ))
              )}
            </div>
          </div>

          {/* Reports */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b border-[#6DA77A] pb-1">
              Student Reports
            </h2>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="italic text-[#9B9B9B]">No reports yet...</p>
              ) : (
                reports.map((r, i) => (
                  <div key={i} className="bg-[#F4F7F4] p-3 rounded-md text-[#333] border border-[#C8D8C4]">
                    {r}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recordings */}
          <div>
            <h2 className="text-xl font-semibold mb-3 border-b border-[#6DA77A] pb-1">
              Recordings
            </h2>
            <div className="flex flex-col gap-3">
              {recordings.length === 0 ? (
                <p className="italic text-[#9B9B9B]">No recordings yet...</p>
              ) : (
                recordings.map((r, i) => (
                  <audio key={i} controls src={URL.createObjectURL(r)} className="w-full" />
                ))
              )}
            </div>
          </div>

          {/* Save Lesson */}
          <div className="mt-10">
            <button
              onClick={async () => {
                if (!user) {
                  alert("You must be logged in to save lessons.");
                  return;
                }

                if (recordings.length === 0 || transcripts.length === 0 || reports.length === 0) {
                  alert("Please finish a recording before saving.");
                  return;
                }

                try {
                  const audioBlob = recordings[0];
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const audioBase64 = reader.result as string;

                    const lessonData = {
                      date: new Date().toISOString(),
                      transcript: transcripts[0],
                      report: reports[0],
                      audio: audioBase64,
                    };

                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    let existingLessons: any[] = [];

                    if (userSnap.exists() && userSnap.data().savedLessons) {
                      existingLessons = userSnap.data().savedLessons;
                    }

                    const updatedLessons = [lessonData, ...existingLessons].slice(0, 5);

                    await setDoc(userRef, { savedLessons: updatedLessons }, { merge: true });
                    alert("✅ Lesson saved to your profile!");
                  };

                  reader.readAsDataURL(audioBlob);
                } catch (error) {
                  console.error("Error saving lesson:", error);
                  alert("Failed to save lesson.");
                }
              }}
              className="px-6 py-3 bg-[#4C7153] hover:bg-[#3E5D45] text-white font-semibold rounded-xl shadow-sm transition text-lg"
            >
              💾 Save Lesson
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-8 text-center text-[#7A7A7A] text-sm">
        © {new Date().getFullYear()} Virtual Classroom · Built with Next.js + OpenAI Realtime
      </footer>
    </main>
  );
}
