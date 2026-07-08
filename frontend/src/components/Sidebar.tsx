"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, CheckSquare, MessageSquare, Briefcase, BarChart3, LogOut, User, Award } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState('participant');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUserRole(u.role);
        setUserName(u.full_name);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Programmes', href: '/programs', icon: BookOpen },
    { name: 'Attendance Hub', href: '/attendance', icon: CheckSquare },
    { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  ];

  // Admin and Staff links
  if (userRole === 'admin' || userRole === 'staff') {
    navLinks.unshift({ name: 'Admin Dashboard', href: '/dashboard/admin', icon: BarChart3 });
    navLinks.push({ name: 'Corporate Portals', href: '/corporate', icon: Briefcase });
  } else if (userRole === 'trainer' || userRole === 'external_trainer') {
    navLinks.unshift({ name: 'Trainer Dashboard', href: '/dashboard/trainer', icon: BarChart3 });
  } else {
    navLinks.unshift({ name: 'My Dashboard', href: '/dashboard/participant', icon: User });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg">
            N
          </div>
          <span className="font-extrabold text-lg tracking-wider text-orange-500">
            HRDC Nexus
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/30">
          <div className="text-xs text-orange-400 font-bold uppercase tracking-widest">{userRole.replace('_', ' ')}</div>
          <div className="text-sm font-semibold text-slate-100 truncate mt-1">{userName}</div>
        </div>

        {/* Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
