"use client";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// // TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWE1M6kRz63wVUfhyCQtErKbE7z5hH5uA",
  authDomain: "virtual-classroom-798c7.firebaseapp.com",
  projectId: "virtual-classroom-798c7",
  storageBucket: "virtual-classroom-798c7.firebasestorage.app",
  messagingSenderId: "905440523598",
  appId: "1:905440523598:web:d40f147b5cc51dfb221a1f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");     // Auth needs email
  const [password, setPassword] = useState(""); // Auth stores this securely (hashed)
  const [msg, setMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password); // 1) create account
      await setDoc(doc(db, "users", cred.user.uid), { name, email });           // 2) save profile
      setMsg("Account created and profile saved!");
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup} style={{ display: "grid", gap: 8, maxWidth: 280 }}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password"
             value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign up</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}