/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  FileQuestion,
  CalendarCheck,
  GraduationCap,
  Eye,
  Award,
  Users,
  ShieldAlert,
  TestTube2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'master-data'
  | 'question-banks'
  | 'exams'
  | 'student-exam'
  | 'proctor'
  | 'results'
  | 'users'
  | 'audit-logs'
  | 'testing'
  | 'guide';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { user, hasRole } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Beranda / Ringkasan',
      icon: LayoutDashboard,
      visible: true,
      badge: '',
    },
    {
      id: 'student-exam' as ActiveTab,
      label: 'Ruang Ujian Siswa (CBT)',
      icon: GraduationCap,
      visible: hasRole(['siswa', 'admin']),
      badge: 'CBT',
    },
    {
      id: 'proctor' as ActiveTab,
      label: 'Pengawasan Ujian (Proctor)',
      icon: Eye,
      visible: hasRole(['pengawas', 'guru', 'admin']),
      badge: 'Live',
    },
    {
      id: 'question-banks' as ActiveTab,
      label: 'Bank Soal CBT',
      icon: FileQuestion,
      visible: hasRole(['guru', 'admin']),
      badge: '5 Tipe',
    },
    {
      id: 'exams' as ActiveTab,
      label: 'Jadwal & Paket Ujian',
      icon: CalendarCheck,
      visible: hasRole(['guru', 'admin']),
      badge: '',
    },
    {
      id: 'master-data' as ActiveTab,
      label: 'Data Master Sekolah',
      icon: Database,
      visible: hasRole(['admin', 'guru']),
      badge: 'Kelas I-VI',
    },
    {
      id: 'results' as ActiveTab,
      label: 'Nilai & Hasil Ujian',
      icon: Award,
      visible: true,
      badge: '',
    },
    {
      id: 'users' as ActiveTab,
      label: 'Manajemen Akun & Role',
      icon: Users,
      visible: hasRole(['admin']),
      badge: 'RBAC',
    },
    {
      id: 'audit-logs' as ActiveTab,
      label: 'Log Audit Keamanan',
      icon: ShieldAlert,
      visible: hasRole(['admin']),
      badge: 'System',
    },
    {
      id: 'testing' as ActiveTab,
      label: 'Pusat Pengujian (12 Poin)',
      icon: TestTube2,
      visible: true,
      badge: 'Verifikasi',
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Petunjuk Penggunaan',
      icon: BookOpen,
      visible: true,
      badge: 'Buku Panduan',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4.5rem)] shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Menu Navigasi ({user?.role?.toUpperCase()})
        </p>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#071D49] text-white shadow-md shadow-[#071D49]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#071D49]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#D4AF37]' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#071D49]'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
              </button>
            );
          })}
      </nav>

      {/* School Contact Footer in Sidebar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-[#071D49]">SD Xaverius A1 Ambon</p>
        <p className="text-[10px] text-slate-400">Jl. Pattimura No. 1, Kota Ambon</p>
        <p className="text-[10px] text-[#5BA5D5] font-mono">Firebase RBAC Secured</p>
      </div>
    </aside>
  );
};
