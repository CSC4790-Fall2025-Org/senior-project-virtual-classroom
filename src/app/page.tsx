"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Record Lesson",
    description:
      "Record live lessons with our AI Student, capturing every detail for accurate transcription and analysis.",
    color: "bg-[#2A6A40]",
    image: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png",
    link: "/home", 
  },
  {
    title: "Past Reports",
    description:
      "Access previous graded reports and recordings to track progress and identify areas for improvement.",
    color: "bg-[#EAB308]",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828926.png",
    link: "#",
  },
  {
    title: "General Settings",
    description:
      "Adjust your preferences, manage your account, and customize your experience to suit your teaching style.",
    color: "bg-amber-700",
    image: "https://cdn-icons-png.flaticon.com/512/2098/2098402.png",
    link: "#",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#f1f5f9_100%)] opacity-80" />

      <div className="relative text-center mb-16 z-10 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 leading-snug">
          Welcome to the Virtual Classroom!
        </h1>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 z-10">
        {services.map((service, index) => {
          const CardContent = (
            <motion.div
              className={`${service.color} rounded-3xl shadow-xl hover:shadow-[0_0_40px_rgba(0,0,0,0.25)] transition-transform duration-300 cursor-pointer flex flex-col justify-between items-center text-center p-10 w-[18rem] md:w-[22rem]`}
              whileHover={{ scale: 1.04 }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-6">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-32 h-32 object-contain drop-shadow-md"
                  />
                </div>

                <div className="mb-6">
                  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md">
                    {service.title}
                  </h2>
                </div>

                <p className="text-white/90 text-xl leading-normal max-w-xl mx-auto">
                  {service.description}
                </p>
              </div>

              <div className="inline-flex items-center font-semibold text-white text-xl mt-6 justify-center">
                Learn more <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </motion.div>
          );

          return service.link && service.link !== "#" ? (
            <Link key={index} href={service.link}>
              {CardContent}
            </Link>
          ) : (
            <div key={index}>{CardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
