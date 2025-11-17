"use client";

import { useState, useRef, useEffect } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../login/firebase";

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

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

  // Load user + Firestore settings
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);
      const refUser = doc(db, "users", currentUser.uid);
      const snap = await getDoc(refUser);

      if (snap.exists()) {
        const data = snap.data();
        setStudentGrade(data.studentGrade || "");
        setStudentLanguage(data.language || "English");
      }
    });

    return () => unsub();
  }, []);

  // AI student instructions
  function getStudentInstructions(grade: string, language: string) {
    const langPrefix = language !== "English" ? `Respond in ${language}. ` : "";

    switch (grade) {
      case "Elementary":
        return `${langPrefix}You are an enthusiastic elementary student. Keep answers short and curious.`;
      case "Middle":
        return `${langPrefix}You are a middle school student, curious and learning.`;
      case "High":
        return `${langPrefix}You are a respectful high school student who thinks critically.`;
      case "College":
        return `${langPrefix}You are a college student who speaks thoughtfully.`;
      default:
        return `${langPrefix}You are a curious, attentive student. Respond briefly and politely.`;
    }
  }

  // Connect realtime agent
  async function connectAgent() {
    try {
      await startRecording();

      const res = await fetch("/api/session");
      const data = await res.json();
      const ek = data.value;

      if (!ek) return alert("No ephemeral key returned.");

      const agent = new RealtimeAgent({
        name: "AI Student",
        instructions: getStudentInstructions(studentGrade, studentLanguage),
        voice: "echo",
      });

      const session = new RealtimeSession(agent, { model: "gpt-realtime" });
      sessionRef.current = session;

      await session.connect({ apiKey: ek });
      setConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  function endCall() {
    stopRecording();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setConnected(false);
  }

  // Recording logic
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // When recording stops:
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setRecordings([blob]);

      // Create transcript + report
      const transcript = await transcribeAudio(blob);
      const report = await generateReport(transcript);

      setTranscripts([transcript]);
      setReports([report]);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
  }

  function pauseOrResumeRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec) return;

    if (rec.state === "recording") {
      rec.pause();
      setIsPaused(true);
    } else if (rec.state === "paused") {
      rec.resume();
      setIsPaused(false);
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (!rec) return;

    rec.stop();
    rec.stream.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;

    setIsRecording(false);
    setIsPaused(false);
  }

  // Transcription
  async function transcribeAudio(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob, "lesson.webm");

    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();
    return data.text ?? "Transcription failed";
  }

  // Report generation
  async function generateReport(transcript: string) {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = await res.json();
    return data.report ?? "Failed to generate report";
  }

  // ===============================
  // SAVE LESSON → FIRESTORE + STORAGE
  // ===============================
  async function saveLesson() {
    if (!user) return alert("You must be logged in to save lessons.");
    if (!recordings.length) return alert("No recordings to save.");

    try {
      const audioBlob = recordings[0];

      // 1️⃣ Upload audio file
      const fileName = `lesson-${Date.now()}.webm`;
      const audioRef = ref(storage, `users/${user.uid}/lessons/${fileName}`);
      await uploadBytes(audioRef, audioBlob);

      // 2️⃣ Get audio URL
      const audioURL = await getDownloadURL(audioRef);

      // 3️⃣ Save EVERYTHING to Firestore
      await addDoc(collection(db, "users", user.uid, "lessons"), {
        date: serverTimestamp(),
        transcript: transcripts[0],
        report: reports[0],
        audio: audioURL,
      });

      alert("Lesson saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save lesson.");
    }
  }

  // UI
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAF8] text-[#1F2933] p-10">
      <div className="mb-8 text-center">
        <section className="bg-[#E6F0E6] p-6 rounded-2xl shadow-md border border-[#C8D8C4] mb-10">
          <h1 className="text-4xl font-bold text-[#2F4633] mb-2">Virtual Classroom</h1>
          <p className="text-lg text-[#5A5A5A]">
            Teach your AI student. Save your transcript, report, and audio.
          </p>
        </section>
      </div>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">
        {/* LEFT PANEL */}
        <section className="flex-1 bg-[#E6F0E6] rounded-2xl shadow-md border border-[#C8D8C4] p-8 flex flex-col items-center">
          <header className="w-full text-center mb-8">
            {studentGrade && (
              <p className="text-lg text-[#4C7153] font-medium">
                🎓 Level: {studentGrade} | 🌐 Language: {studentLanguage}
              </p>
            )}
          </header>

          {/* Avatar */}
          <div
            className={`w-56 h-56 mb-8 rounded-full flex items-center justify-center border-4 ${
              connected
                ? "border-[#6DA77A] bg-[#DDF3DF] animate-pulse shadow-[0_0_25px_3px_#6DA77A]"
                : "border-[#C8D8C4] bg-[#F4F7F4]"
            }`}
          >
            <img src="/avatar.png" alt="AI Student" className="h-40 w-40 rounded-full" />
          </div>

          {/* Buttons */}
          {!isRecording && !connected ? (
            <button
              onClick={async () => {
                await startRecording();
                await connectAgent();
              }}
              className="px-8 py-4 bg-[#4C7153] hover:bg-[#3E5D45] text-white font-semibold rounded-xl text-xl"
            >
              🎤 Start Recording
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={pauseOrResumeRecording}
                className={`px-6 py-3 text-white font-semibold rounded-lg text-lg ${
                  isPaused ? "bg-[#A7A7A7]" : "bg-[#E6C84E]"
                }`}
              >
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>

              <button
                onClick={() => {
                  stopRecording();
                  endCall();
                }}
                className="px-6 py-3 bg-[#D65555] text-white font-semibold rounded-lg text-lg"
              >
                ⏹️ Stop
              </button>
            </div>
          )}
        </section>

        {/* RIGHT PANEL */}
        <section className="flex-[1.5] bg-[#E6F0E6] rounded-2xl shadow-md border border-[#C8D8C4] p-8 max-h-[80vh] overflow-y-auto">
          {/* Transcript */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-1 mb-3">Transcript</h2>
            {transcripts.length ? transcripts.map((t, i) => <p key={i}>{t}</p>) : (
              <p className="italic text-gray-500">Transcript will appear here.</p>
            )}
          </div>

          {/* Report */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-1 mb-3">Student Report</h2>
            {reports.length ? reports.map((r, i) => <div key={i} className="bg-white p-4 rounded-md">{r}</div>) : (
              <p className="italic text-gray-500">Report will appear here.</p>
            )}
          </div>

          {/* Audio */}
          <div>
            <h2 className="text-xl font-semibold border-b pb-1 mb-3">Recordings</h2>
            {recordings.length ? recordings.map((r, i) => (
              <audio key={i} controls src={URL.createObjectURL(r)} className="w-full" />
            )) : (
              <p className="italic text-gray-500">No recordings yet.</p>
            )}
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-10">
            <button
              onClick={saveLesson}
              className="px-6 py-3 bg-[#4C7153] hover:bg-[#3E5D45] text-white font-semibold rounded-xl text-lg"
            >
              💾 Save Lesson
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Virtual Classroom
      </footer>
    </main>
  );
}
