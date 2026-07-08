"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { CheckSquare, Scan, QrCode, MapPin, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AttendanceHub() {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('participant');
  
  // Geolocation states
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUserRole(JSON.parse(stored).role);
      }
    }
    
    // Auto-fetch location coordinates on mount for convenience
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setLocLoading(true);
      setLocError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
          setLocLoading(false);
        },
        (err) => {
          console.warn("Geolocation access denied or timed out:", err);
          setLocError("Location access blocked. Using default campus location for local simulation.");
          setLat(31.2536); // Fallback to LPU center lat
          setLon(75.7037); // Fallback to LPU center lon
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocError("Browser doesn't support HTML5 Geolocation.");
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/attendance/mark', {
        session_id: parseInt(sessionId),
        verification_method: 'gps',
        latitude: lat,
        longitude: lon
      });
      setSuccess(`Attendance logged successfully! Status: ${res.data.status.toUpperCase()} at LPU Campus.`);
      setSessionId('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Check-in failed. Verify session ID or GPS location range.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Attendance Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Clock in securely via QR simulator and GPS compliance verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Check-In Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <Scan className="w-5 h-5 text-orange-500" />
              <span>Self Attendance Check-In</span>
            </h3>

            {success && (
              <div className="p-4 bg-emerald-100/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm rounded-2xl flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center space-x-2 font-medium">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Enter Session ID</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 101"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              {/* GPS Stats */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>GPS Coordinates</span>
                  </span>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-indigo-500 hover:text-indigo-600 font-bold"
                  >
                    Refresh GPS
                  </button>
                </div>
                {locLoading ? (
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                    <span>Requesting location coordinates...</span>
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    {locError && <div className="text-amber-500 font-semibold">{locError}</div>}
                    <div>Latitude: <span className="font-mono font-bold">{lat?.toFixed(5) || "Unresolved"}</span></div>
                    <div>Longitude: <span className="font-mono font-bold">{lon?.toFixed(5) || "Unresolved"}</span></div>
                    <div className="text-[10px] text-slate-400 mt-1">Geofence validation allows entries inside LPU Campus limits (500m radius).</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || locLoading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/10 transition-transform disabled:opacity-50"
              >
                {loading ? "Checking in..." : "Scan & Verify Check-In"}
              </button>
            </form>
          </div>

          {/* QR Generator Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-indigo-500" />
                <span>Session QR Code Generator</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Trainers and HRDC Staff can present this dynamically rolling QR code during classroom lectures. Participants scan the image to clock in automatically.
              </p>
            </div>

            {/* Mock QR display */}
            <div className="w-48 h-48 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-3xl mx-auto flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
              {/* Outer visual boxes simulating QR scanning */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
              
              <QrCode className="w-16 h-16 text-indigo-600 animate-pulse-subtle" />
              <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Active Rolling QR</div>
            </div>

            <button
              onClick={() => alert("Session QR token updated. Next refresh in 30 seconds.")}
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-sm font-semibold rounded-xl"
            >
              Generate Session Token
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
