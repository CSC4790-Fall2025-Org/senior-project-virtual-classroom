"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative px-4">

      {/* Massive Login Card */}
      <div className="w-full max-w-7xl bg-white shadow-2xl rounded-3xl p-32">
        <h1 className="text-8xl font-extrabold text-center">Login</h1>
        <p className="text-center text-gray-500 mt-6 text-3xl">
          To get started, you need to sign in here
        </p>

        <div className="mt-16 space-y-14">
          <div>
            <label className="block text-3xl font-semibold mb-4">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-8 py-6 border text-2xl rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-3xl font-semibold">Password</label>
              <a href="#" className="text-xl text-green-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-8 py-6 border text-2xl rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <input type="checkbox" id="remember" className="h-8 w-8" />
            <label htmlFor="remember" className="text-2xl text-gray-600">
              Remember me
            </label>
          </div>

          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-3xl rounded-xl font-bold">
            Sign In
          </button>

          <p className="text-center text-2xl text-gray-600 mt-10">
            Don’t have an account?{" "}
            <a href="#" className="text-green-500 hover:underline font-semibold">
              Create an account
            </a>
          </p>
          <p className="text-center text-lg text-gray-400 mt-4">
            Rest easy knowing your data is protected with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
