"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  deleteObject,
} from "firebase/storage";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../login/firebase";

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "classroom" | "lessons"
  >("general");

  // ---- Auth + Firestore ----
  const [user, setUser] = useState<any>(null);

  // ---- General state ----
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Classroom settings ----
  const [studentGrade, setStudentGrade] = useState("");
  const [language, setLanguage] = useState("English");

  // ---- Load current user ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");

        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setProfileImage(data.profileImage || null);
          setStudentGrade(data.studentGrade || "");
          setLanguage(data.language || "English");
        }
      }
    });

    return () => unsub();
  }, []);

  // ---- Upload Profile Picture ----
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ---- Save General Settings ----
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Not signed in.");

    await setDoc(
      doc(db, "users", user.uid),
      { name, email, phone, profileImage },
      { merge: true }
    );

    alert("Profile updated!");
  };

  // ---- Save Classroom Settings ----
  const handleClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Not signed in.");

    await setDoc(
      doc(db, "users", user.uid),
      { studentGrade, language },
      { merge: true }
    );

    alert("Classroom settings saved!");
  };

  // ---- If not logged in ----
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
          <h1 className="text-5xl font-bold mb-6">Not Signed In</h1>
          <p className="text-2xl text-gray-600">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // MAIN PAGE LAYOUT
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-2xl">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r px-8 py-12 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="h-32 w-32 rounded-full bg-green-100 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="h-10 w-10 text-green-600 mx-auto mt-10" />
              )}
            </div>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "general"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              General Settings
            </button>

            <button
              onClick={() => setActiveTab("classroom")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "classroom"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Classroom Settings
            </button>

            <button
              onClick={() => setActiveTab("lessons")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "lessons"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Saved Lessons
            </button>
          </nav>
        </aside>

        <main className="flex-1 px-16 py-12">
          {/* ---- GENERAL ---- */}
          {activeTab === "general" && (
            <GeneralSettingsTab
              name={name}
              setName={setName}
              email={email}
              phone={phone}
              setPhone={setPhone}
              profileImage={profileImage}
              handleUploadClick={handleUploadClick}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleGeneralSubmit={handleGeneralSubmit}
            />
          )}

          {/* ---- CLASSROOM ---- */}
          {activeTab === "classroom" && (
            <ClassroomSettingsTab
              studentGrade={studentGrade}
              setStudentGrade={setStudentGrade}
              language={language}
              setLanguage={setLanguage}
              handleClassroomSubmit={handleClassroomSubmit}
            />
          )}

          {/* ---- SAVED LESSONS ---- */}
          {activeTab === "lessons" && <SavedLessons userId={user.uid} />}
        </main>
      </div>
    </div>
  );
}

/* ===========================================================
   SAVED LESSONS
   Loads lessons from Firestore subcollection
   Deletes: Firestore doc + Storage audio file
   Plays audio from Storage URL
=========================================================== */
function SavedLessons({ userId }: { userId: string }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "users", userId, "lessons"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLessons(data);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  // DELETE LESSON
  const handleDelete = async (lesson: any) => {
    try {
      // 🔥 1. Delete Firestore document
      await deleteDoc(doc(db, "users", userId, "lessons", lesson.id));

      // 🔥 2. Delete audio file from storage
      // audio URL example:
      // https://firebasestorage.googleapis.com/v0/b/myproject.appspot.com/o/users%2FUID%2Flessons%2Flesson-123.webm
      const pathname = decodeURIComponent(new URL(lesson.audio).pathname);
      // → /v0/b/bucket/o/users/UID/lessons/lesson-TIMESTAMP.webm
      const fullPath = pathname.split("/o/")[1]; // users/UID/lessons/file.webm

      const audioRef = ref(storage, fullPath);
      await deleteObject(audioRef);

      alert("Lesson deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete lesson.");
    }
  };

  if (loading) return <p className="text-gray-500 text-xl">Loading…</p>;
  if (lessons.length === 0)
    return <p className="text-gray-600 text-xl">No lessons saved yet.</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-12">
      <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
        Saved Lessons
      </h2>

      <div className="space-y-10">
        {lessons.map((lesson, idx) => (
          <div
            key={lesson.id}
            className="border rounded-xl p-6 bg-gray-50 shadow-inner relative"
          >
            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDelete(lesson)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition"
              title="Delete Lesson"
            >
              <Trash2 className="h-6 w-6" />
            </button>

            <p className="text-gray-700 font-bold text-2xl mb-2">
              Lesson {idx + 1} —{" "}
              {lesson.date?.toDate
                ? lesson.date.toDate().toLocaleString()
                : "No Date"}
            </p>

            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Transcript:</span>{" "}
              {lesson.transcript.slice(0, 200)}…
            </p>

            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Report:</span>{" "}
              {lesson.report.slice(0, 200)}…
            </p>

            {/* AUDIO PLAYER */}
            {lesson.audio && (
              <audio
                controls
                src={lesson.audio}
                className="w-full mt-3 rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================================================
   General & Classroom Tab Components
=========================================================== */

function GeneralSettingsTab({
  name,
  setName,
  email,
  phone,
  setPhone,
  profileImage,
  handleUploadClick,
  fileInputRef,
  handleFileChange,
  handleGeneralSubmit,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12">
      <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
        General Settings
      </h2>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10"
        onSubmit={handleGeneralSubmit}
      >
        {/* Profile Upload */}
        <div className="flex items-center space-x-4">
          <span className="font-bold text-gray-700 w-40">Profile:</span>
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center px-6 py-3 border rounded-lg text-green-600 border-green-300 hover:bg-green-50 text-xl"
          >
            <Upload className="h-6 w-6 mr-2" />
            Upload Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Name */}
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700 w-40">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-xl"
          />
        </div>

        {/* Email */}
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700 w-40">Email:</label>
          <input
            type="email"
            value={email}
            readOnly
            className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-gray-500 text-xl"
          />
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700 w-40">Phone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-xl"
          />
        </div>

        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-xl"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function ClassroomSettingsTab({
  studentGrade,
  setStudentGrade,
  language,
  setLanguage,
  handleClassroomSubmit,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12">
      <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
        Classroom Settings
      </h2>

      <form
        onSubmit={handleClassroomSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10"
      >
        {/* Grade */}
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700 w-40">Grade:</label>
          <select
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
            className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-xl"
          >
            <option value="">Select grade</option>
            <option value="Elementary">Elementary</option>
            <option value="Middle">Middle School</option>
            <option value="High">High School</option>
            <option value="College">College</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700 w-40">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-xl"
          >
            <option value="English">English</option>
            <option value="Japanese">Japanese</option>
            <option value="Italian">Italian</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>

        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-xl"
          >
            Save Classroom Settings
          </button>
        </div>
      </form>
    </div>
  );
}
