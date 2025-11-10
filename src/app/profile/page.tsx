"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../login/firebase";

const db = getFirestore(app);
const auth = getAuth(app);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "classroom" | "lessons">("general");

  // ---- Auth + Firestore user ----
  const [user, setUser] = useState<any>(null);

  // ---- General page state ----
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Classroom page state ----
  const [studentGrade, setStudentGrade] = useState("");
  const [language, setLanguage] = useState("English");

  // ---- Load current user + Firestore data ----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setPhone(data.phone || "");
            setProfileImage(data.profileImage || null);
            setStudentGrade(data.studentGrade || "");
            setLanguage(data.language || "English");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ---- Handle Profile Picture Upload ----
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ---- Save General Settings ----
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to save settings.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name, email, phone, profileImage },
        { merge: true }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  // ---- Save Classroom Settings ----
  const handleClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to save settings.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { studentGrade, language },
        { merge: true }
      );
      alert("Classroom settings saved!");
    } catch (error) {
      console.error("Error saving classroom settings:", error);
      alert("Failed to save classroom settings.");
    }
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

  // ---- Main Page Layout ----
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-2xl">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r px-8 py-12 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="h-10 w-10 text-green-600" />
              )}
            </div>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "general"
                  ? "bg-green-100 text-green-800 font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab("classroom")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "classroom"
                  ? "bg-green-100 text-green-800 font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Classroom Settings
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
                activeTab === "lessons"
                  ? "bg-green-100 text-green-800 font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Saved Lessons
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-16 py-12">
          {activeTab === "general" && (
            // --- General Settings Tab ---
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
                General Settings
              </h2>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10"
                onSubmit={handleGeneralSubmit}
              >
                {/* Profile Picture Upload */}
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-700 w-40">
                    Profile picture:
                  </span>
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
                    accept="image/*"
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
                    placeholder="Enter your name"
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 text-gray-500 text-xl"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">
                    Phone number:
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  />
                </div>

                {/* Submit */}
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
          )}

          {activeTab === "classroom" && (
            // --- Classroom Settings Tab ---
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
                Classroom Settings
              </h2>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10"
                onSubmit={handleClassroomSubmit}
              >
                {/* Grade Level */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">Grade:</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  >
                    <option value="">Select grade</option>
                    <option value="Elementary">Elementary School</option>
                    <option value="Middle">Middle School</option>
                    <option value="High">High School</option>
                    <option value="College">College / University</option>
                  </select>
                </div>

                {/* Language */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">
                    Language:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  >
                    <option value="English">English</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Italian">Italian</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                {/* Submit */}
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
          )}

          {activeTab === "lessons" && (
            // --- Saved Lessons Tab ---
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-8 text-3xl">
                Saved Lessons
              </h2>

              {!user && <p>Please sign in to view your saved lessons.</p>}

              {user && <SavedLessons userId={user.uid} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================
// SavedLessons Subcomponent
// ==========================
function SavedLessons({ userId }: { userId: string }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const docRef = doc(getFirestore(app), "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().savedLessons) {
          setLessons(docSnap.data().savedLessons);
        }
      } catch (err) {
        console.error("Error loading saved lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [userId]);

  const handleDelete = async (index: number) => {
    try {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      await setDoc(doc(getFirestore(app), "users", userId), { savedLessons: updatedLessons }, { merge: true });
      setLessons(updatedLessons);
      alert("Lesson deleted successfully!");
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    }
  };

  if (loading) return <p className="text-gray-500 text-xl">Loading lessons...</p>;
  if (lessons.length === 0)
    return <p className="text-gray-600 text-xl">No saved lessons yet.</p>;

  return (
    <div className="space-y-8">
      {lessons.map((lesson, idx) => (
        <div
          key={idx}
          className="border rounded-xl p-6 bg-gray-50 shadow-inner relative"
        >
          <button
            onClick={() => handleDelete(idx)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition"
            title="Delete Lesson"
          >
            <Trash2 className="h-6 w-6" />
          </button>
          <p className="text-gray-700 font-bold text-2xl mb-2">
            Lesson {idx + 1} — {new Date(lesson.date).toLocaleString()}
          </p>
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Transcript:</span>{" "}
            {lesson.transcript.slice(0, 200)}...
          </p>
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Report:</span>{" "}
            {lesson.report.slice(0, 200)}...
          </p>
          {lesson.audio && (
            <audio controls src={lesson.audio} className="w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
