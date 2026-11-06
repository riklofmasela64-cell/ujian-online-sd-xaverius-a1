/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { User, LogOut, KeyRound, ShieldCheck, Database, School, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface HeaderProps {
  onOpenPasswordModal: () => void;
  onOpenTestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPasswordModal, onOpenTestModal }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'ADMINISTRATOR', bg: 'bg-red-100 text-red-800 border-red-300' };
      case 'guru':
        return { label: 'DEWAN GURU', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'pengawas':
        return { label: 'PENGAWAS CBT', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'siswa':
        return { label: 'PESERTA SISWA', bg: 'bg-sky-100 text-sky-800 border-sky-300' };
      default:
        return { label: 'PENGGUNA', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-[#071D49] border-b-2 border-[#D4AF37] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
              <Logo size="md" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">
                  XAVERIUS <span className="text-[#D4AF37]">EXAM</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5BA5D5]/20 text-[#5BA5D5] border border-[#5BA5D5]/40">
                  <Database className="w-2.5 h-2.5" /> Firebase Firestore
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 hidden sm:block">
                SD Xaverius A1 Ambon • CBT Examination Platform
              </p>
            </div>
          </div>

          {/* Right Section: School Academic Year & User Session */}
          <div className="flex items-center gap-3">
            {/* Testing Center Shortcut */}
            <button
              onClick={onOpenTestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#D4AF37] text-[#071D49] hover:bg-[#F6E07A] transition-all shadow-sm cursor-pointer"
              title="Pusat Verifikasi & Uji Sistem (12 Poin Pengujian)"
            >
              <ShieldCheck className="w-4 h-4 text-[#071D49]" />
              <span className="hidden md:inline">Uji Sistem (12 Poin)</span>
            </button>

            {/* Academic badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/10 text-slate-200 border border-white/15">
              <School className="w-3.5 h-3.5 text-[#5BA5D5]" />
              <span>TP 2024/2025 • Ganjil</span>
            </div>

            {/* User Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer border border-transparent hover:border-white/20"
                >
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#071D49] font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white/30">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-white line-clamp-1 max-w-[140px]">
                      {user.fullName}
                    </p>
                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-[#071D49]">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                      <span className={`mt-1 inline-block text-[10px] font-black px-2 py-0.5 rounded border ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenPasswordModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                        <span>Ganti Password Pribadi</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
