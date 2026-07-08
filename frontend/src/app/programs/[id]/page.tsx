"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { BookOpen, Calendar, MapPin, Users, Upload, FileText, CheckCircle2, MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [program, setProgram] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('participant');
  
  // Modal forms
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [ratingTrainer, setRatingTrainer] = useState(5);
  const [ratingContent, setRatingContent] = useState(5);
  const [comments, setComments] = useState('');

  const fetchProgramData = async () => {
    try {
      const progRes = await api.get(`/programs/${id}`);
      setProgram(progRes.data);

      const sessRes = await api.get(`/programs/${id}/sessions`);
      setSessions(sessRes.data);

      const docRes = await api.get(`/content/program/${id}`);
      setDocuments(docRes.data);
    } catch (err) {
      console.error("Fetch program details failed: loading fallback dataset", err);
      // Fallback
      setProgram({
        id: parseInt(id),
        title: "Agentic AI & LangGraph FDP",
        category: "FDP",
        description: "An intensive professional development series covering semantic search pipelines, pgvector indices, and conversational LangGraph router setups.",
        objectives: "1. Construct multi-agent states.\n2. Enable local sentence embeddings.\n3. Integrate Groq Llama3 chat completions.",
        venue: "Block 32, Room 402",
        mode: "hybrid",
        start_date: "2026-06-01T10:00:00",
        end_date: "2026-06-07T17:00:00",
        max_capacity: 50,
        current_enrollment_count: 45
      });
      setSessions([
        { id: 101, session_number: 1, topic: "Intro to LangGraph StateGraphs", start_time: "2026-07-10T10:00:00", end_time: "2026-07-10T12:00:00", venue: "Block 32-402" },
        { id: 102, session_number: 2, topic: "pgvector RAG Indices", start_time: "2026-07-11T14:00:00", end_time: "2026-07-11T16:00:00", venue: "Block 32-402" }
      ]);
      setDocuments([
        { id: 1, title: "LangGraph Architecture Blueprint", file_url: "/uploads/blueprints.pdf", file_type: "pdf" }
      ]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUserRole(JSON.parse(stored).role);
      }
    }
    fetchProgramData();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await api.post('/programs/enroll', { program_id: parseInt(id) });
      alert("Enrollment successful!");
      fetchProgramData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Already enrolled or program is full.");
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('program_id', id);
    formData.append('title', docTitle);
    formData.append('file', selectedFile);

    try {
      await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowDocModal(false);
      setDocTitle('');
      setSelectedFile(null);
      fetchProgramData();
      alert("Material uploaded and indexed into AI Knowledge RAG base!");
    } catch (err: any) {
      alert("Upload failed. Ensure you have network connectivity and appropriate rights.");
    } finally {
      setUploading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/feedback/', {
        program_id: parseInt(id),
        feedback_type: 'program',
        rating_trainer: ratingTrainer,
        rating_content: ratingContent,
        rating_facilities: 5,
        comments
      });
      setShowFeedbackModal(false);
      setComments('');
      alert("Thank you for your valuable feedback!");
    } catch (err: any) {
      alert("Feedback submission failed. Check program enrollment status.");
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/programs')}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Directory</span>
        </button>

        {/* Hero Section details */}
        {program && (
          <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-500/20 blur-[100px] pointer-events-none" />
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                {program.category}
              </span>
              <h1 className="text-3xl font-black">{program.title}</h1>
              <p className="text-slate-400 text-sm max-w-3xl">{program.description}</p>
              
              <div className="flex flex-wrap gap-6 pt-4 text-xs font-bold text-slate-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Start Date: {new Date(program.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>Venue: {program.venue || "LPU Campus"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>Capacity: {program.current_enrollment_count || 0} / {program.max_capacity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                {userRole === 'participant' && (
                  <button
                    onClick={handleEnroll}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
                  >
                    Enroll in Program
                  </button>
                )}
                {userRole === 'participant' && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Provide Feedback</span>
                  </button>
                )}
                {['admin', 'staff', 'trainer'].includes(userRole) && (
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center space-x-2 shadow-md shadow-indigo-600/10"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Syllabus Notes</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions timeline */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>Syllabus Timetable Timeline</span>
            </h2>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 pl-6 ml-4 space-y-8">
              {sessions.map((s, idx) => (
                <div key={s.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-slate-800 shadow" />
                  
                  <div className="space-y-1">
                    <div className="text-xs text-orange-500 font-bold">Session {s.session_number}</div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{s.topic}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold">{s.venue || "Campus Class"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span>Training Materials (RAG Source)</span>
            </h2>

            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">
                  No resources uploaded yet for this programme.
                </div>
              ) : (
                documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-3 hover:border-orange-500/50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-950 dark:text-white truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 capitalize uppercase">{doc.file_type} file</div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal for Document Upload */}
        {showDocModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
              <h2 className="text-2xl font-extrabold">Upload Study Material</h2>
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Document Title</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    placeholder="e.g. LangGraph CheatSheet"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select File (PDF, DOCX, TXT)</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 dark:file:bg-orange-950/20 dark:file:text-orange-400 hover:file:bg-orange-100"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDocModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-650"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Ingesting..." : "Upload & Index"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Feedback */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
              <h2 className="text-2xl font-extrabold">Program Quality Feedback</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Rate Trainer Competence (1-5)</label>
                  <select
                    value={ratingTrainer}
                    onChange={(e) => setRatingTrainer(parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Rate Curriculum Relevance (1-5)</label>
                  <select
                    value={ratingContent}
                    onChange={(e) => setRatingContent(parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Suggestions / Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm h-24"
                    placeholder="Provide comments on content/materials..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-semibold hover:bg-slate-250 dark:hover:bg-slate-650"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
