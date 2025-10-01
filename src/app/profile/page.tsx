"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "classroom">("general");

  // ---- General page state ----
  const [twoFA, setTwoFA] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Classroom page state ----
  const [studentGrade, setStudentGrade] = useState("");
  const [language, setLanguage] = useState("English");

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("General settings submitted:", { twoFA, profileImage });
    alert("General settings saved!");
  };

  const handleClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Classroom settings submitted:", { studentGrade, language, twoFA });
    alert("Classroom settings saved!");
  };

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
              General settings
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
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold">
              Lesson Materials
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold">
              Storage Dashboard
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-16 py-12">
          {activeTab === "general" ? (
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
                General settings
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
                    name="name"
                    placeholder="Enter your name"
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">
                    Email address:
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">
                    Phone number:
                  </label>
                  <input
                    type="tel"
                    name="phone"
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
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
                Classroom Settings
              </h2>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10"
                onSubmit={handleClassroomSubmit}
              >
                {/* Student Grade Level */}
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-gray-700 w-40">Grade Level:</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                  >
                    <option value="">Select level</option>
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
        </main>
      </div>
    </div>
  );
}
