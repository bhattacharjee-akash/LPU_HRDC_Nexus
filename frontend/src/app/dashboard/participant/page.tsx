"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { BookOpen, CheckSquare, Award, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ParticipantDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipantData() {
      try {
        // Enrolled programs & certificates check
        const enrollRes = await api.get('/programs/my-enrollments');
        setEnrollments(enrollRes.data);

        const certRes = await api.get('/certificates/my-certificates');
        setCertificates(certRes.data);
      } catch (err) {
        console.error("Participant fetch failed: using mock user items", err);
        setEnrollments([
          { id: 201, program_title: "Agentic AI & LangGraph FDP", program_category: "FDP", attendance_percentage: 88.0, eligible: true },
          { id: 202, program_title: "Next.js 15 Enterprise Architecture", program_category: "Workshop", attendance_percentage: 60.0, eligible: false }
        ]);
        setCertificates([
          { id: 301, program_title: "Agentic AI & LangGraph FDP", certificate_hash: "28e001ba9d...", file_url: "/certificates/verify/28e001ba9d" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchParticipantData();
  }, []);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Participant Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Access your course materials, submit assignments, track attendance levels, and claim certification hashes.
          </p>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>Enrolled Training Programs</span>
            </h3>

            <div className="space-y-4">
              {enrollments.map((enr) => (
                <div key={enr.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="text-xs text-orange-500 font-bold tracking-wide uppercase">{enr.program_category || "FDP"}</div>
                    <div className="text-lg font-bold mt-1 text-slate-900 dark:text-white">{enr.program_title || "Training Cycle"}</div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Attendance: {enr.attendance_percentage || 0}%</span>
                      </div>
                      {enr.attendance_percentage < 75 && (
                        <div className="flex items-center space-x-1 text-red-500 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Requires 75% for certificate</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/programs/${enr.program_id || 1}`}>
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-transform hover:scale-[1.01]">
                      <span>Enter Class</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates Panel */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span>Earned Credentials</span>
            </h3>

            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No certificates issued yet. Complete program requirements to claim.
                </div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                    <div>
                      <div className="text-xs text-slate-400">Certificate Hash:</div>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">{cert.certificate_hash}</div>
                    </div>
                    <Link href={`/certificates/verify/${cert.certificate_hash}`} target="_blank">
                      <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10">
                        Verify Credential
                      </button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
