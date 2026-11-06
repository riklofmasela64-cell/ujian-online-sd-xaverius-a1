/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Exam, ExamSession, Result } from '../types';
import {
  GraduationCap,
  Clock,
  Key,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  ShieldAlert,
  Award,
  Layers,
  Sparkles,
  ZoomIn,
  X,
  Image as ImageIcon,
} from 'lucide-react';

export const StudentExamView: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Session State
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [violationCount, setViolationCount] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Load available exams
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.exams.getAll();
        const activeList = (res.exams || []).filter((e: Exam) => e.status === 'active');
        setExams(activeList);

        // Check if a direct exam link is accessed via URL
        const params = new URLSearchParams(window.location.search);
        const directExamId = params.get('exam') || params.get('examId');
        const directToken = params.get('token');

        if (directExamId) {
          const matched = activeList.find((e: Exam) => e.examId === directExamId);
          if (matched) {
            setSelectedExam(matched);
            setTokenInput((directToken || matched.token || '').toUpperCase());
          }
        }
      } catch (e) {
        console.error('Failed to load exams', e);
      }
    }
    loadExams();
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (!activeSession || result) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, result]);

  // Anti-Cheat Proctoring (Tab Switch & Window Blur Detection)
  useEffect(() => {
    if (!activeSession || result) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setViolationCount((prev) => prev + 1);
        try {
          await api.exams.logEvent(
            activeSession.sessionId,
            'tab_switch',
            'Peserta meninggalkan tab ujian atau meminimalkan browser'
          );
        } catch (e) {
          console.error('Failed to log cheat event', e);
        }
      }
    };

    const handleWindowBlur = async () => {
      setViolationCount((prev) => prev + 1);
      try {
        await api.exams.logEvent(
          activeSession.sessionId,
          'window_blur',
          'Layar ujian kehilangan fokus kursor/jendela'
        );
      } catch (e) {
        console.error('Failed to log blur event', e);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeSession, result]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setTokenError(null);
    setLoading(true);

    try {
      const res = await api.exams.startSession(selectedExam.examId, tokenInput);
      setActiveSession(res.session);
      setQuestions(res.questions);
      setRemainingSeconds((res.exam.duration || 60) * 60);

      // Hydrate previously saved answers if any
      const ansMap: Record<string, any> = {};
      const flagMap: Record<string, boolean> = {};
      res.savedAnswers?.forEach((a: any) => {
        ansMap[a.questionId] = a.answer;
        flagMap[a.questionId] = a.flagged || false;
      });
      setAnswers(ansMap);
      setFlagged(flagMap);
      setCurrentIndex(0);
    } catch (err: any) {
      setTokenError(err.message || 'Token tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (val: any) => {
    const currQ = questions[currentIndex];
    if (!currQ || !activeSession) return;

    const updated = { ...answers, [currQ.questionId]: val };
    setAnswers(updated);

    // Autosave immediately to server
    try {
      await api.exams.saveAnswer(
        activeSession.sessionId,
        currQ.questionId,
        val,
        flagged[currQ.questionId]
      );
    } catch (e) {
      console.warn('Autosave failed temporarily', e);
    }
  };

  const handleToggleFlag = async () => {
    const currQ = questions[currentIndex];
    if (!currQ || !activeSession) return;

    const nextState = !flagged[currQ.questionId];
    setFlagged({ ...flagged, [currQ.questionId]: nextState });

    try {
      await api.exams.saveAnswer(
        activeSession.sessionId,
        currQ.questionId,
        answers[currQ.questionId],
        nextState
      );
    } catch (e) {
      console.warn('Flag save failed', e);
    }
  };

  const handleSubmitExam = async () => {
    if (!activeSession) return;
    setSubmitting(true);
    try {
      const res = await api.exams.submit(activeSession.sessionId);
      setResult(res.result);
      setIsSubmitModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan ujian.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Result Score Card View
  if (result) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#071D49] border border-blue-200">
            Ujian Telah Selesai
          </span>
          <h2 className="text-xl font-black text-[#071D49] mt-3">{result.examName}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Peserta: <strong>{result.studentName}</strong> (NIS: {result.studentNis})
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Akhir</p>
          <div className="text-5xl font-black text-[#071D49] my-2">
            {result.finalScore} <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-600">
            Benar: <strong className="text-emerald-600">{result.correctAnswersCount || 0}</strong> • Salah/Kosong:{' '}
            <strong className="text-red-500">{result.wrongAnswersCount || 0}</strong>
          </p>
        </div>

        {violationCount > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Terdeteksi {violationCount} kali perpindahan layar/jendela tercatat di log pengawas.</span>
          </div>
        )}

        <button
          onClick={() => {
            setResult(null);
            setActiveSession(null);
            setSelectedExam(null);
          }}
          className="px-6 py-2.5 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all shadow-md cursor-pointer"
        >
          Kembali ke Beranda Ujian
        </button>
      </div>
    );
  }

  // 2. Token Entry & Exam Selection View
  if (!activeSession) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-[#071D49] text-[#D4AF37]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#071D49]">Ruang Ujian Siswa (CBT)</h2>
              <p className="text-xs text-slate-500">
                Pilih paket ujian aktif dan masukkan token dari pengawas ruang.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="block text-xs font-bold text-slate-700">Pilih Paket Ujian Aktif:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exams.map((ex) => (
                <div
                  key={ex.examId}
                  onClick={() => setSelectedExam(ex)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedExam?.examId === ex.examId
                      ? 'border-[#071D49] bg-blue-50/50 shadow-md ring-2 ring-[#071D49]/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    Aktif
                  </span>
                  <h4 className="text-xs font-bold text-[#071D49] mt-2 mb-1">{ex.examName}</h4>
                  <p className="text-[11px] text-slate-500">
                    Durasi: {ex.duration} Menit • {ex.questionIds?.length} Soal
                  </p>
                </div>
              ))}
            </div>

            {selectedExam && (
              <form onSubmit={handleStartExam} className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                {tokenError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{tokenError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Masukkan Token Ujian (Tanya Pengawas):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: XAV6A"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                      className="px-4 py-2.5 text-sm border-2 border-slate-300 rounded-xl font-mono uppercase font-black text-[#071D49] focus:outline-none focus:border-[#071D49] w-48 tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setTokenInput(selectedExam.token || 'XAV6A')}
                      className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Gunakan Token Demo ({selectedExam.token || 'XAV6A'})
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Peraturan & Integritas Ujian:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-amber-800">
                    <li>Dilarang membuka tab lain atau meminimalkan jendela ujian.</li>
                    <li>Sistem proctoring mencatat setiap perpindahan layar ke server.</li>
                    <li>Jawaban disimpan otomatis (autosave) setiap Anda memilih opsi.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Menyiapkan Soal...' : 'Mulai Mengerjakan Ujian'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Live Active CBT Examination Screen
  const currQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = currQ ? answers[currQ.questionId] : undefined;

  return (
    <div className="space-y-4">
      {/* Top Floating Exam Control Bar */}
      <div className="sticky top-18 z-30 bg-white p-4 rounded-2xl border-2 border-[#D4AF37]/40 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Paket Ujian Aktif</span>
          <h3 className="text-sm font-black text-[#071D49] line-clamp-1">{activeSession.examName}</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Anti-cheat violation pill */}
          {violationCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-300">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>{violationCount} Pelanggaran</span>
            </div>
          )}

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071D49] text-white font-mono font-bold text-sm shadow-inner">
            <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className={remainingSeconds < 300 ? 'text-red-400 font-black' : 'text-white'}>
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Selesai Ujian
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col justify-between">
            <div>
              {/* Question Meta */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-[#071D49]">
                  Soal Nomor {currentIndex + 1} dari {questions.length}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Tipe: {currQ?.questionType}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700 cursor-pointer ml-3 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <input
                      type="checkbox"
                      checked={flagged[currQ?.questionId] || false}
                      onChange={handleToggleFlag}
                      className="rounded text-amber-600"
                    />
                    <span>Ragu-ragu</span>
                  </label>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">
                {currQ?.questionText}
              </p>

              {/* Question Images (If attached: Diagrams, Maps, Charts, etc.) */}
              {currQ?.imageReferences && currQ.imageReferences.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                  {currQ.imageReferences.map((imgSrc: string, imgIdx: number) => (
                    <div
                      key={imgIdx}
                      className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-xs max-w-full sm:max-w-md transition-all hover:border-[#071D49]"
                    >
                      <img
                        src={imgSrc}
                        alt={`Ilustrasi Soal ${currentIndex + 1} (${imgIdx + 1})`}
                        className="max-h-72 w-auto object-contain mx-auto rounded-xl p-1 cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                        onClick={() => setZoomImage(imgSrc)}
                      />
                      <div className="p-2 bg-white/95 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Gambar #{imgIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setZoomImage(imgSrc)}
                          className="px-2.5 py-1 bg-[#071D49] hover:bg-[#0A2255] text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <ZoomIn className="w-3 h-3 text-[#D4AF37]" /> Perbesar Gambar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Render by Question Type */}
              {currQ?.questionType === 'multiple_choice' && (() => {
                const hasOptionImages = currQ.options?.some((opt: any) => !!opt.image);
                return (
                  <div className={`grid ${hasOptionImages ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                    {currQ.options?.map((opt: any, i: number) => {
                      const isSelected = currentAnswer === opt.id;
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleAnswerChange(opt.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'border-[#071D49] bg-blue-50/70 font-bold text-[#071D49] shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected ? 'bg-[#071D49] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">{opt.text || `Pilihan ${letter}`}</span>
                          </div>

                          {/* Gambar Opsi jika tersedia */}
                          {opt.image && (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 flex flex-col items-center">
                              <img
                                src={opt.image}
                                alt={`Gambar Opsi ${letter}`}
                                className="h-32 sm:h-36 w-full object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomImage(opt.image);
                                }}
                                className="mt-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <ZoomIn className="w-3 h-3 text-[#D4AF37]" /> Perbesar Opsi {letter}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {currQ?.questionType === 'complex_mc' && (() => {
                const hasOptionImages = currQ.options?.some((opt: any) => !!opt.image);
                return (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 italic mb-2">
                      * Pilihlah semua jawaban yang menurut Anda benar (bisa lebih dari satu).
                    </p>
                    <div className={`grid ${hasOptionImages ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {currQ.options?.map((opt: any, i: number) => {
                        const ansArr: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];
                        const isChecked = ansArr.includes(opt.id);
                        const letter = String.fromCharCode(65 + i);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              const updated = isChecked
                                ? ansArr.filter((id) => id !== opt.id)
                                : [...ansArr, opt.id];
                              handleAnswerChange(updated);
                            }}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              isChecked
                                ? 'border-[#071D49] bg-blue-50/70 font-bold text-[#071D49] shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                className="w-4 h-4 text-[#071D49] rounded cursor-pointer"
                              />
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                                  isChecked ? 'bg-[#071D49] text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold">{opt.text || `Pilihan ${letter}`}</span>
                            </div>

                            {/* Gambar Opsi jika tersedia */}
                            {opt.image && (
                              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 flex flex-col items-center">
                                <img
                                  src={opt.image}
                                  alt={`Gambar Opsi ${letter}`}
                                  className="h-32 sm:h-36 w-full object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomImage(opt.image);
                                  }}
                                  className="mt-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <ZoomIn className="w-3 h-3 text-[#D4AF37]" /> Perbesar Opsi {letter}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {currQ?.questionType === 'matching' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 italic mb-2">
                    * Pasangkan setiap premis di sebelah kiri dengan pilihan respon yang tepat:
                  </p>
                  {currQ.matchingPairs?.map((pair: any) => {
                    const matchAns = currentAnswer || {};
                    return (
                      <div
                        key={pair.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-bold text-slate-800 sm:w-1/2">{pair.premise}</span>
                        <div className="flex items-center gap-2 sm:w-1/2">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <select
                            value={matchAns[pair.id] || ''}
                            onChange={(e) => {
                              const updated = { ...matchAns, [pair.id]: e.target.value };
                              handleAnswerChange(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                          >
                            <option value="">-- Pilih Pasangan --</option>
                            {currQ.matchingPairs.map((p: any) => (
                              <option key={p.id} value={p.response}>
                                {p.response}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currQ?.questionType === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleAnswerChange('tf_true')}
                    className={`py-4 px-6 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                      currentAnswer === 'tf_true'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    BENAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerChange('tf_false')}
                    className={`py-4 px-6 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                      currentAnswer === 'tf_false'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    SALAH
                  </button>
                </div>
              )}

              {currQ?.questionType === 'essay' && (
                <div>
                  <textarea
                    rows={4}
                    placeholder="Ketikkan jawaban Anda secara jelas dan lengkap..."
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#071D49] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Jawaban tersimpan otomatis saat Anda mengetik.</p>
                </div>
              )}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>

              <span className="text-xs text-slate-400 font-mono">Autosave: Aktif</span>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  Kumpulkan Ujian <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Grid Sidebar (1 Col) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#D4AF37]" /> Lembar Navigasi Soal
          </h4>

          {/* Color legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-500 font-semibold pb-2 border-b">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dijawab
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ragu
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Belum
            </div>
          </div>

          {/* Grid buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const hasAns = answers[q.questionId] !== undefined && answers[q.questionId] !== '';
              const isFlag = flagged[q.questionId];
              const isCurrent = currentIndex === idx;

              let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
              if (isFlag) {
                btnClass = 'bg-amber-400 text-amber-950 font-black';
              } else if (hasAns) {
                btnClass = 'bg-emerald-600 text-white font-bold';
              }

              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer ${btnClass} ${
                    isCurrent ? 'ring-2 ring-offset-2 ring-[#071D49] scale-105 shadow-sm' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t text-[11px] text-slate-500 space-y-1">
            <p>
              Dijawab:{' '}
              <strong className="text-emerald-700">
                {Object.values(answers).filter((a) => a !== undefined && a !== '').length}
              </strong>{' '}
              / {questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-[#071D49]">Konfirmasi Selesai Ujian</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menyelesaikan dan mengumpulkan lembar jawaban ujian ini? Jawaban tidak dapat diubah kembali setelah dikirimkan.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 border border-slate-300 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitExam}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                {submitting ? 'Mengirim Jawaban...' : 'Ya, Kumpulkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Image Modal for Student Examination */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full z-10 transition-all cursor-pointer"
              title="Tutup Perbesaran"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Perbesaran Gambar Soal Ujian"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl mx-auto"
            />
            <p className="text-center text-xs text-slate-500 font-bold py-2">
              Perbesaran Gambar Soal • SD Xaverius A1 Ambon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
