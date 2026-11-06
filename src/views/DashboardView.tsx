/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  CalendarCheck,
  Award,
  Eye,
  ShieldCheck,
  School,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
    questions: 0,
    exams: 0,
    results: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [masterRes, qbRes, examRes, resRes] = await Promise.all([
          api.master.getAll().catch(() => ({ students: [], teachers: [], classes: [], subjects: [] })),
          api.questionBanks.getAll().catch(() => ({ questions: [] })),
          api.exams.getAll().catch(() => ({ exams: [] })),
          api.results.getAll().catch(() => ({ results: [] })),
        ]);

        setStats({
          students: masterRes.students?.length || 0,
          teachers: masterRes.teachers?.length || 0,
          classes: masterRes.classes?.length || 0,
          subjects: masterRes.subjects?.length || 0,
          questions: qbRes.questions?.length || 0,
          exams: examRes.exams?.length || 0,
          results: resRes.results?.length || 0,
        });
      } catch (e) {
        console.error('Error loading dashboard stats', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#071D49] via-[#0D2E6F] to-[#071D49] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-2 border-[#D4AF37]/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tahap 2: Firebase Authentication & Cloud Firestore</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang, {user?.fullName}!
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            Portal Ujian Berbasis Komputer (CBT) dan Bank Soal Terpadu{' '}
            <strong className="text-[#D4AF37]">SD Xaverius A1 Ambon</strong>. Hak akses aktif:{' '}
            <span className="font-bold uppercase tracking-wider text-[#5BA5D5] bg-white/10 px-2 py-0.5 rounded">
              {user?.role}
            </span>
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {user?.role === 'siswa' && (
              <button
                onClick={() => onNavigate('student-exam')}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#071D49] font-bold text-xs hover:bg-[#F6E07A] transition-all flex items-center gap-2 shadow-lg shadow-black/20 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> Masuk Ruang Ujian Siswa
              </button>
            )}

            {(user?.role === 'guru' || user?.role === 'admin') && (
              <>
                <button
                  onClick={() => onNavigate('question-banks')}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#071D49] font-bold text-xs hover:bg-[#F6E07A] transition-all flex items-center gap-2 shadow-lg shadow-black/20 cursor-pointer"
                >
                  <FileQuestion className="w-4 h-4" /> Kelola Bank Soal (5 Tipe)
                </button>
                <button
                  onClick={() => onNavigate('exams')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" /> Paket Ujian
                </button>
              </>
            )}

            {user?.role === 'pengawas' && (
              <button
                onClick={() => onNavigate('proctor')}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#071D49] font-bold text-xs hover:bg-[#F6E07A] transition-all flex items-center gap-2 shadow-lg shadow-black/20 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Buka Ruang Monitoring Pengawas
              </button>
            )}

            <button
              onClick={() => onNavigate('testing')}
              className="px-4 py-2.5 rounded-xl bg-[#5BA5D5]/20 text-white border border-[#5BA5D5]/40 font-bold text-xs hover:bg-[#5BA5D5]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#5BA5D5]" /> Uji 12 Skenario Sistem
            </button>

            <button
              onClick={() => onNavigate('guide')}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Petunjuk Penggunaan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#071D49] flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6 text-[#071D49]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Siswa Terdaftar</p>
            <p className="text-xl font-black text-[#071D49]">{stats.students}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Dewan Guru</p>
            <p className="text-xl font-black text-[#071D49]">{stats.teachers}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#5BA5D5] flex items-center justify-center font-bold">
            <FileQuestion className="w-6 h-6 text-[#5BA5D5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Butir Soal Bank</p>
            <p className="text-xl font-black text-[#071D49]">{stats.questions}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <School className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Rombel Kelas (I-VI)</p>
            <p className="text-xl font-black text-[#071D49]">{stats.classes}</p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate('question-banks')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#D4AF37] transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#071D49]/10 text-[#071D49] flex items-center justify-center mb-4 group-hover:bg-[#071D49] group-hover:text-white transition-colors">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#071D49] mb-1">Bank Soal Multi-Tipe</h3>
          <p className="text-xs text-slate-500 mb-4">
            Mendukung 5 jenis butir soal: Pilihan Ganda, Pilihan Ganda Kompleks, Menjodohkan, Benar/Salah, dan Essay.
          </p>
          <span className="text-xs font-bold text-[#071D49] flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
            Buka Bank Soal <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('student-exam')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#D4AF37] transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#5BA5D5] flex items-center justify-center mb-4 group-hover:bg-[#5BA5D5] group-hover:text-white transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#071D49] mb-1">CBT Exam Engine</h3>
          <p className="text-xs text-slate-500 mb-4">
            Ujian real-time dengan timer countdown, navigasi nomor, autosave jawaban, dan deteksi kecurangan tab switch.
          </p>
          <span className="text-xs font-bold text-[#071D49] flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
            Masuk CBT <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('testing')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#D4AF37] transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] group-hover:text-[#071D49] transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#071D49] mb-1">Verifikasi Keamanan</h3>
          <p className="text-xs text-slate-500 mb-4">
            Laporan pengujian otomatis untuk 12 skenario autentikasi, Firestore Security Rules, dan perlindungan kunci jawaban.
          </p>
          <span className="text-xs font-bold text-[#071D49] flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
            Jalankan Uji <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
