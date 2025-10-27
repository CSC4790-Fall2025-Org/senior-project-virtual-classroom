"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Lesson Control",
    subtitle: "& Feedback",
    description:
      "Tools to start or record lessons, upload materials, and view real-time student feedback during class.",
    color: "bg-[#2A6A40]",
    image: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png",
    link: "/home", 
  },
  {
    title: "Reports",
    subtitle: "& Insights",
    description:
      "Access graded reports and performance trends to track progress and identify areas for improvement.",
    color: "bg-[#EAB308]",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828926.png",
    link: "#",
  },
  {
    title: "Settings",
    subtitle: "& Notifications",
    description:
      "Quickly adjust classroom settings and stay updated with alerts about lessons, feedback, and storage.",
    color: "bg-amber-700",
    image: "https://cdn-icons-png.flaticon.com/512/2098/2098402.png",
    link: "#",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#f1f5f9_100%)] opacity-80"></div>

      <div className="relative text-center mb-20 z-10">
        <p className="text-[#2A6A40] font-semibold uppercase tracking-widest text-2xl">
          Our Services
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mt-6 max-w-5xl mx-auto leading-snug">
          Everything you need to teach, improve, and stay in control.
        </h1>
      </div>

      <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-16 max-w-[90rem] z-10">
        {services.map((service, index) => {
          const CardContent = (
            <motion.div
              className={`${service.color} rounded-3xl shadow-2xl hover:shadow-[0_0_60px_rgba(0,0,0,0.25)] transition-transform duration-300 cursor-pointer flex flex-col justify-between items-center text-center p-16`}
              style={{ width: "36rem", height: "48rem" }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-8">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-44 h-44 object-contain drop-shadow-lg"
                  />
                </div>

                <div className="mb-8">
                  <h2 className="text-6xl md:text-7xl font-extrabold leading-tight drop-shadow-md">
                    {service.title}
                  </h2>
                  <h3 className="text-5xl md:text-6xl font-semibold opacity-90 -mt-2">
                    {service.subtitle}
                  </h3>
                </div>

                <p className="text-white/90 text-3xl leading-relaxed max-w-2xl mx-auto">
                  {service.description}
                </p>
              </div>

              <div className="inline-flex items-center font-semibold text-white text-2xl mt-8 justify-center">
                Learn more <ArrowRight className="ml-3 w-6 h-6" />
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
