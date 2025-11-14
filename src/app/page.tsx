"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Mic, FileText, Brain, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center overflow-hidden text-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#eef4ef_100%)]" />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mt-24 mb-16 max-w-3xl px-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Welcome to <span className="text-green-700"> The Virtual Classroom</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Teach your own AI-powered student, receive instant feedback, and
          improve your teaching skills — all in one interactive learning space.
        </p>

        <Link
          href="/classroom"
          className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl text-lg font-semibold shadow-md hover:bg-green-700 transition"
        >
          Start Teaching <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 px-10 max-w-6xl mb-24"
      >
        {[
          {
            icon: <Mic className="h-10 w-10 text-green-700" />,
            title: "Real Conversations",
            desc: "Speak naturally — the AI student listens, responds, and learns just like a real one.",
          },
          {
            icon: <FileText className="h-10 w-10 text-green-700" />,
            title: "Instant Feedback",
            desc: "Receive detailed reports after each session to help refine your teaching methods.",
          },
          {
            icon: <Brain className="h-10 w-10 text-green-700" />,
            title: "Save & Review Lessons",
            desc: "Store your best lessons, replay audio, and track your progress over time.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-200"
          >
            <div className="mb-4 flex justify-center">{f.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {f.title}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Call to Action / Footer */}
      <footer className="relative z-10 text-center pb-10">
        <p className="text-gray-500 text-lg">
          © {new Date().getFullYear()} Virtual Classroom · Built with Next.js + OpenAI
        </p>
      </footer>
    </div>
  );
}
