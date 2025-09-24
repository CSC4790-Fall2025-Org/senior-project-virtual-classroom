"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

export default function ProfilePage() {
  const [twoFA, setTwoFA] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-2xl">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r px-8 py-12 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center">
              <Upload className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <nav className="space-y-4">
            <button className="w-full text-left px-4 py-3 bg-green-100 text-green-800 rounded-lg font-bold">
              General settings
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold">
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

        {/* Main content */}
        <main className="flex-1 px-16 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold mb-12 text-3xl">
              General settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
              {/* Profile Picture Upload */}
              <div className="flex items-center space-x-4">
                <span className="font-bold text-gray-700 w-40">
                  Profile picture:
                </span>
                <button className="flex items-center px-6 py-3 border rounded-lg text-green-600 border-green-300 hover:bg-green-50 text-xl">
                  <Upload className="h-6 w-6 mr-2" />
                  Upload Image
                </button>
              </div>

              {/* Name */}
              <div className="flex items-center space-x-4">
                <label className="font-bold text-gray-700 w-40">Name:</label>
                <input
                  type="text"
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
                  placeholder="Enter your phone number"
                  className="flex-1 px-6 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                />
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center space-x-4">
                <label className="font-bold text-gray-700 w-40">2FA</label>
                <div className="scale-200">
                  <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
