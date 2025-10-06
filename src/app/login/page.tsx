"use client";

import { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [user, setUser] = useState(null);

  // 👇 Keeps track of signed-in user automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in!");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    alert("Signed out!");
  };

  // If user is signed in, show their info + sign out
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-16 rounded-3xl shadow-2xl text-center">
          <h1 className="text-6xl font-bold mb-6">Welcome!</h1>
          <p className="text-3xl mb-10">{user.email}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white py-4 px-8 text-2xl rounded-xl font-bold"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, show login/signup form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-7xl bg-white shadow-2xl rounded-3xl p-32">
        <h1 className="text-8xl font-extrabold text-center">
          {isNewUser ? "Create Account" : "Login"}
        </h1>

        <div className="mt-16 space-y-14">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-8 py-6 border text-2xl rounded-xl"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-8 py-6 border text-2xl rounded-xl"
          />
          <button
            onClick={handleAuth}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-3xl rounded-xl font-bold"
          >
            {isNewUser ? "Sign Up" : "Sign In"}
          </button>

          <p className="text-center text-2xl text-gray-600 mt-10">
            {isNewUser ? "Already have an account?" : "Don’t have an account?"}{" "}
            <a
              href="#"
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-green-500 hover:underline font-semibold"
            >
              {isNewUser ? "Sign in" : "Create one"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
