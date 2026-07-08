"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { BookOpen, Calendar, MapPin, Tag, Search, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsDirectory() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Program creation fields (Modal UI state)
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FDP');
  const [mode, setMode] = useState('offline');
  const [venue, setVenue] = useState('LPU Campus');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('50');

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data);
    } catch (err) {
      console.error("Fetch programs failed: using default templates", err);
      setPrograms([
        { id: 1, title: "Agentic AI & LangGraph FDP", category: "FDP", description: "Design complex multi-agent systems using LangGraph and Groq APIs.", start_date: "2026-06-01T10:00:00", mode: "hybrid", venue: "Block 32, Room 402", current_enrollment_count: 45, max_capacity: 50 },
        { id: 2, title: "Next.js 15 Enterprise Architecture", category: "Workshop", description: "Learn Server Components, server actions, and offline service caching.", start_date: "2026-07-15T09:00:00", mode: "online", venue: "Zoom Meeting Room", current_enrollment_count: 12, max_capacity: 60 },
        { id: 3, title: "Research Methodology in ML", category: "Workshop", description: "Standard literature reviews, research papers indexing, and experimental setups.", start_date: "2026-08-01T10:00:00", mode: "offline", venue: "HRDC Seminar Hall", current_enrollment_count: 5, max_capacity: 30 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/programs/', {
        title,
        description,
        category,
        mode,
        venue,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        max_capacity: parseInt(maxCapacity),
        status: 'upcoming'
      });
      setShowModal(false);
      fetchPrograms();
      // Clear fields
      setTitle(''); setDescription(''); setStartDate(''); setEndDate('');
    } catch (err) {
      alert("Failed to create program: verify you are authorized as admin/staff.");
    }
  };

  const filtered = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Programmes Directory</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Browse academic and technical training schedules.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Programme</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search programmes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            <option value="FDP">Faculty Development (FDP)</option>
            <option value="Workshop">Workshops</option>
            <option value="Certification">Certifications</option>
          </select>
        </div>

        {/* Programme grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                    {p.category}
                  </span>
                  <span className="text-xs text-slate-400 capitalize font-bold">{p.mode}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{p.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3">{p.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Start: {new Date(p.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{p.venue || "LPU Campus"}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                  <span>Enrolled: {p.current_enrollment_count || 0} / {p.max_capacity}</span>
                </div>
                
                <Link href={`/programs/${p.id}`}>
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]">
                    <span>View Sessions & Syllabus</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Program creation */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create New Programme</h2>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Programme Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    placeholder="e.g. Generative AI Foundations"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm h-24"
                    placeholder="Programme goals and outcomes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    >
                      <option value="FDP">FDP</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Certification">Certification</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-600 dark:text-slate-350"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-600 dark:text-slate-350"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Venue</label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Capacity</label>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Create
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
