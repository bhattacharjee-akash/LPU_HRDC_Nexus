"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { BookOpen, UserCheck, ShieldAlert, FileText, ArrowRight, ClipboardCheck } from 'lucide-react';

export default function TrainerDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainerData() {
      try {
        // Query trainer specific classes and student project files
        // Fallbacks if backend server is starting up or has not seeded custom courses
        setSessions([
          { id: 101, program_title: "Agentic AI & LangGraph FDP", topic: "Intro to LangGraph Chains", start_time: "2026-07-10T10:00:00", venue: "Block 32-402" },
          { id: 102, program_title: "Agentic AI & LangGraph FDP", topic: " pgvector RAG Setup", start_time: "2026-07-11T14:00:00", venue: "Block 32-402" }
        ]);
        setSubmissions([
          { id: 1, student_name: "Aman Singh", assignment_title: "Build LangGraph Router", submitted_at: "2026-07-07", status: "pending" },
          { id: 2, student_name: "Neha Gupta", assignment_title: "Build LangGraph Router", submitted_at: "2026-07-08", status: "pending" }
        ]);
      } catch (err) {
        console.error("Trainer fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainerData();
  }, []);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Trainer Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your curriculum materials, attendance records, and evaluate participants.
          </p>
        </div>

        {/* Action Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trainer Schedule */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>Your Scheduled Classes</span>
            </h3>

            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-orange-500 font-bold">{s.program_title}</div>
                    <div className="text-base font-bold mt-1 text-slate-900 dark:text-white">{s.topic}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(s.start_time).toLocaleString()} | {s.venue}</div>
                  </div>
                  <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/10">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Student Submissions Evaluation */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-500" />
              <span>Submissions Pending Evaluation</span>
            </h3>

            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{sub.student_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub.assignment_title}</div>
                    <div className="text-xs text-slate-400 mt-1">Submitted: {sub.submitted_at}</div>
                  </div>
                  <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-semibold transition-colors">
                    Grade
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
