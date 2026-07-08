"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ShieldAlert, Cpu, Users, BarChart3, Sun, Moon, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Sync with theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/25 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full z-10 glass border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
            N
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-orange-500 to-indigo-600 bg-clip-text text-transparent">
            LPU HRDC Nexus
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 hover:scale-105 transition-transform"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          
          <Link href={isLoggedIn ? "/programs" : "/login"}>
            <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all hover:translate-y-[-1px]">
              <span>{isLoggedIn ? "Enter Dashboard" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-20 text-center max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30">
            LPU Training Lifecycle Hub
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
            Transforming Professional Development <br />
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              With Agentic AI & RAG
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300">
            A secure Progressive Web App built to schedule, track, audit, and verify Faculty Development Programmes, Orientation Courses, and Corporate Partnerships.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link href={isLoggedIn ? "/programs" : "/login"}>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]">
                Explore Programmes
              </button>
            </Link>
            <Link href="/login?tab=register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-lg transition-all hover:scale-[1.02] border border-slate-300/50 dark:border-slate-700/50">
                Register as Participant
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full text-left">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl glass border border-slate-200/60 dark:border-slate-800/60 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">LangGraph AI Agent</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Query attendance rates, summarize training files, compile statistics, and execute audits instantly using Llama-3 reasoning graphs.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl glass border border-slate-200/60 dark:border-slate-800/60 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart QR & GPS Verify</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Clock into sessions securely. Verify attendance perimeters via GPS geofencing, automatic late flags, and attendance percentage graphs.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl glass border border-slate-200/60 dark:border-slate-800/60 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Interactive Syllabus</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Submit MCQs, case study essays, coding assignments, and get automatic evaluations. Download certificate hashes with QR-code validations.
            </p>
          </motion.div>
        </div>

        {/* Platform Stat Banner */}
        <div className="w-full mt-24 py-8 px-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-orange-500">120+</div>
            <div className="text-slate-400 text-sm mt-1">Annual FDPs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-400">15,000+</div>
            <div className="text-slate-400 text-sm mt-1">Faculty Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-pink-500">98.2%</div>
            <div className="text-slate-400 text-sm mt-1">Satisfaction Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">100%</div>
            <div className="text-slate-400 text-sm mt-1">Verified Certificates</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-sm z-10 glass">
        &copy; {new Date().getFullYear()} Lovely Professional University (LPU) - HRDC. All rights reserved.
      </footer>
    </div>
  );
}
