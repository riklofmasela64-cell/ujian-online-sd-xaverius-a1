/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Lock, User, AlertCircle, ArrowRight, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onOpenTestModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenTestModal }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [examParam, setExamParam] = useState<string | null>(null);
  const [tokenParam, setTokenParam] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ex = params.get('exam') || params.get('examId');
    const tok = params.get('token');
    if (ex) setExamParam(ex);
    if (tok) setTokenParam(tok);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Mohon masukkan username dan password.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071D49] via-[#0A2255] to-[#04112E] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#5BA5D5]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#071D49] to-[#0D2E6F] p-6 text-white text-center relative border-b-2 border-[#D4AF37]">
            <div className="flex justify-center mb-3">
              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                <Logo size="lg" showText={false} />
              </div>
            </div>
            <h1 className="text-xl font-black tracking-wider text-white">
              XAVERIUS <span className="text-[#D4AF37]">EXAM</span>
            </h1>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              SD XAVERIUS A1 AMBON
            </p>
            <p className="text-[11px] text-[#5BA5D5] mt-1 font-medium">
              Sistem Ujian Berbasis Komputer (CBT) & Bank Soal
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <h2 className="text-base font-bold text-[#071D49] mb-1">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mb-6">
              Gunakan username dan password yang diberikan oleh pihak sekolah.
            </p>

            {examParam && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Tautan Langsung Ujian Terdeteksi</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Anda membuka link ujian langsung. Silakan masuk dengan akun siswa Anda untuk langsung diarahkan ke lembar pengerjaan soal{tokenParam ? ` (Token: ${tokenParam})` : ''}.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#071D49] focus:outline-none transition-all placeholder:text-slate-400"
                    placeholder="Contoh: admin, guru_maria, siswa_albert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#071D49] focus:outline-none transition-all placeholder:text-slate-400"
                    placeholder="Masukkan password Anda..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold transition-all shadow-lg shadow-[#071D49]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Examiner/Evaluator */}
            {/* Quick Login Options for All Roles */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Akun Masuk Cepat (Quick Fill):
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'AdminXaverius2025!')}
                  className="p-2 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="block font-bold text-xs text-[#071D49]">1. Administrator</span>
                    <span className="text-[10px] text-slate-500 font-mono">user: <strong>admin</strong></span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#071D49] text-white">
                    ADMIN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('guru', 'GuruXaverius2025!')}
                  className="p-2 text-left rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="block font-bold text-xs text-emerald-950">2. Dewan Guru</span>
                    <span className="text-[10px] text-emerald-700 font-mono">user: <strong>guru</strong></span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    GURU
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('pengawas', 'PengawasXaverius2025!')}
                  className="p-2 text-left rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="block font-bold text-xs text-amber-950">3. Pengawas Ruang</span>
                    <span className="text-[10px] text-amber-700 font-mono">user: <strong>pengawas</strong></span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white">
                    PENGAWAS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('siswa', 'SiswaXaverius2025!')}
                  className="p-2 text-left rounded-xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="block font-bold text-xs text-sky-950">4. Peserta Siswa</span>
                    <span className="text-[10px] text-sky-700 font-mono">user: <strong>siswa</strong></span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#5BA5D5] text-white">
                    SISWA
                  </span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center mt-1">
                Password default Guru: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600 font-bold">GuruXaverius2025!</code> (atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">password123</code>)
              </p>
            </div>

            {/* Quick Testing suite link */}
            <div className="mt-4 pt-3 text-center">
              <button
                type="button"
                onClick={onOpenTestModal}
                className="text-[11px] font-bold text-[#071D49] hover:text-[#5BA5D5] underline decoration-[#D4AF37] decoration-2 transition-colors cursor-pointer"
              >
                Lihat Hasil Uji Keamanan Sistem (12 Skenario Pengujian)
              </button>
            </div>
          </div>
        </div>

        {/* School Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2025 SD Xaverius A1 Ambon • Terintegrasi Firebase Authentication & Cloud Firestore
        </p>
      </div>
    </div>
  );
};
