/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { QuestionBankItem, QuestionOption, QuestionType, Subject, SchoolClass } from '../types';
import {
  FileQuestion,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Filter,
  Eye,
  X,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  ZoomIn,
} from 'lucide-react';

export const QuestionBankView: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestionBankItem | null>(null);
  const [previewItem, setPreviewItem] = useState<QuestionBankItem | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Form State
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qSubjectId, setQSubjectId] = useState('');
  const [qGrade, setQGrade] = useState('VI');
  const [qText, setQText] = useState('');
  const [qWeight, setQWeight] = useState<number>(20);
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qImages, setQImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Options for Multiple Choice
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt_a', text: '', image: '', isCorrect: true },
    { id: 'opt_b', text: '', image: '', isCorrect: false },
    { id: 'opt_c', text: '', image: '', isCorrect: false },
    { id: 'opt_d', text: '', image: '', isCorrect: false },
  ]);
  const [optionUrlIndex, setOptionUrlIndex] = useState<number | null>(null);
  const [tempOptionUrl, setTempOptionUrl] = useState('');

  // Matching Pairs
  const [matchingPairs, setMatchingPairs] = useState([
    { id: 'm1', premise: '', response: '' },
    { id: 'm2', premise: '', response: '' },
    { id: 'm3', premise: '', response: '' },
  ]);

  // True/False
  const [tfAnswer, setTfAnswer] = useState<'tf_true' | 'tf_false'>('tf_true');

  // Essay Accepted Answer
  const [essayAnswer, setEssayAnswer] = useState('');
  const [essayRubric, setEssayRubric] = useState('');

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const [qRes, masterRes] = await Promise.all([
        api.questionBanks.getAll(),
        api.master.getAll(),
      ]);
      setQuestions(qRes.questions || []);
      setSubjects(masterRes.subjects || []);
      setClasses(masterRes.classes || []);
    } catch (e) {
      console.error('Failed to load question bank', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setQType('multiple_choice');
    setQSubjectId(subjects[0]?.subjectId || 'sbj_ipas');
    setQGrade('VI');
    setQText('');
    setQWeight(20);
    setQDifficulty('medium');
    setQImages([]);
    setImageUrlInput('');
    setOptionUrlIndex(null);
    setTempOptionUrl('');
    setOptions([
      { id: 'opt_a', text: '', image: '', isCorrect: true },
      { id: 'opt_b', text: '', image: '', isCorrect: false },
      { id: 'opt_c', text: '', image: '', isCorrect: false },
      { id: 'opt_d', text: '', image: '', isCorrect: false },
    ]);
    setMatchingPairs([
      { id: 'm1', premise: '', response: '' },
      { id: 'm2', premise: '', response: '' },
    ]);
    setTfAnswer('tf_true');
    setEssayAnswer('');
    setEssayRubric('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: QuestionBankItem) => {
    setEditingItem(item);
    setQType(item.questionType);
    setQSubjectId(item.subjectId);
    setQGrade(item.gradeLevel || 'VI');
    setQText(item.questionText);
    setQWeight(item.weight || 20);
    setQDifficulty(item.difficulty || 'medium');
    setQImages(item.imageReferences ? [...item.imageReferences] : []);
    setImageUrlInput('');
    setOptionUrlIndex(null);
    setTempOptionUrl('');

    if (item.options) {
      setOptions(
        item.options.map((o) => ({
          id: o.id,
          text: o.text,
          image: o.image || '',
          isCorrect: !!o.isCorrect,
        }))
      );
    }
    if (item.matchingPairs) {
      setMatchingPairs(item.matchingPairs);
    }
    if (item.questionType === 'true_false') {
      setTfAnswer((item.answerKey as any) || 'tf_true');
    }
    if (item.questionType === 'essay') {
      setEssayAnswer(item.acceptedAnswers?.[0] || '');
      setEssayRubric(item.rubric || '');
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`File ${file.name} melebihi batas 3MB. Silakan gunakan gambar yang lebih kecil.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setQImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setQImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setQImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert(`File gambar opsi ${String.fromCharCode(65 + index)} melebihi batas 3MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOptions((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: event.target!.result as string };
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyOptionUrl = (index: number) => {
    if (!tempOptionUrl.trim()) return;
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: tempOptionUrl.trim() };
      return updated;
    });
    setTempOptionUrl('');
    setOptionUrlIndex(null);
  };

  const handleRemoveOptionImage = (index: number) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: '' };
      return updated;
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus butir soal ini dari Bank Soal?')) return;
    try {
      await api.questionBanks.delete(id);
      loadQuestions();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus butir soal.');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) {
      alert('Teks pertanyaan wajib diisi.');
      return;
    }

    let payload: Partial<QuestionBankItem> = {
      subjectId: qSubjectId,
      subjectName: subjects.find((s) => s.subjectId === qSubjectId)?.subjectName,
      gradeLevel: qGrade,
      classId: 'cls_6a',
      questionType: qType,
      questionText: qText,
      imageReferences: qImages,
      weight: Number(qWeight),
      difficulty: qDifficulty,
    };

    if (qType === 'multiple_choice') {
      payload.options = options;
      const correctOpt = options.find((o) => o.isCorrect);
      payload.answerKey = correctOpt?.id || options[0].id;
    } else if (qType === 'complex_mc') {
      payload.options = options;
      payload.answerKey = options.filter((o) => o.isCorrect).map((o) => o.id);
    } else if (qType === 'matching') {
      payload.matchingPairs = matchingPairs;
    } else if (qType === 'true_false') {
      payload.options = [
        { id: 'tf_true', text: 'BENAR', isCorrect: tfAnswer === 'tf_true' },
        { id: 'tf_false', text: 'SALAH', isCorrect: tfAnswer === 'tf_false' },
      ];
      payload.answerKey = tfAnswer;
    } else if (qType === 'essay') {
      payload.acceptedAnswers = [essayAnswer];
      payload.rubric = essayRubric;
    }

    try {
      if (editingItem) {
        await api.questionBanks.update(editingItem.questionId, payload);
      } else {
        await api.questionBanks.create(payload);
      }
      setIsModalOpen(false);
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan butir soal.');
    }
  };

  const getTypeName = (t: QuestionType) => {
    switch (t) {
      case 'multiple_choice':
        return 'Pilihan Ganda';
      case 'complex_mc':
        return 'Pilihan Ganda Kompleks';
      case 'matching':
        return 'Menjodohkan';
      case 'true_false':
        return 'Benar / Salah';
      case 'essay':
        return 'Uraian / Isian Singkat';
      default:
        return t;
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
    const matchType = selectedType === 'all' || q.questionType === selectedType;
    return matchSubject && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-[#D4AF37]" /> Modul Bank Soal CBT SD Xaverius A1
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mendukung 5 jenis butir soal dengan pembobotan, analisis kesulitan, dan perlindungan kunci jawaban.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Butir Soal Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <Filter className="w-4 h-4 text-[#D4AF37]" /> Filter:
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        >
          <option value="all">Semua Mata Pelajaran</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        >
          <option value="all">Semua Tipe Soal</option>
          <option value="multiple_choice">Pilihan Ganda</option>
          <option value="complex_mc">Pilihan Ganda Kompleks</option>
          <option value="matching">Menjodohkan</option>
          <option value="true_false">Benar / Salah</option>
          <option value="essay">Uraian / Isian Singkat</option>
        </select>

        <span className="ml-auto text-slate-500 font-medium text-xs">
          Menampilkan {filteredQuestions.length} butir soal
        </span>
      </div>

      {/* Question List */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.questionId}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#D4AF37] transition-all shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#071D49] text-white flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#071D49] border border-blue-200">
                  {getTypeName(q.questionType)}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {q.subjectName || 'IPAS'} • Tingkat {q.gradeLevel || 'VI'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Bobot: {q.weight || 20}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    q.difficulty === 'easy'
                      ? 'bg-emerald-50 text-emerald-800'
                      : q.difficulty === 'hard'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {q.difficulty?.toUpperCase()}
                </span>
                <button
                  onClick={() => setPreviewItem(q)}
                  className="p-1.5 text-slate-500 hover:text-[#071D49] hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Lihat Pratinjau Soal"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(q)}
                  className="p-1.5 text-slate-500 hover:text-[#071D49] hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Edit Butir Soal"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(q.questionId)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Hapus Butir Soal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-800 mb-3 whitespace-pre-wrap">
              {q.questionText}
            </p>

            {/* Lampiran Gambar Soal */}
            {q.imageReferences && q.imageReferences.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 items-center">
                {q.imageReferences.map((imgSrc, imgIdx) => (
                  <div
                    key={imgIdx}
                    onClick={() => setZoomImage(imgSrc)}
                    className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-xs hover:border-[#071D49] transition-all"
                    title="Klik untuk melihat perbesaran gambar"
                  >
                    <img
                      src={imgSrc}
                      alt={`Lampiran Soal ${imgIdx + 1}`}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Preview Box (Protected - Only for Teacher/Admin) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-[#071D49] flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Kunci Jawaban & Panduan Penilaian:
              </span>

              {q.questionType === 'multiple_choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col gap-1.5 ${
                        opt.id === q.answerKey
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                          opt.id === q.answerKey ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt.id === q.answerKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        <span className="flex-1">{opt.text || <em className="text-slate-400 font-normal">(Tanpa teks)</em>}</span>
                      </div>
                      {opt.image && (
                        <div
                          onClick={() => setZoomImage(opt.image!)}
                          className="relative group mt-0.5 rounded-lg border border-slate-200 overflow-hidden bg-white p-1 cursor-pointer max-h-24 hover:border-[#071D49] transition-all"
                          title="Klik untuk memperbesar gambar opsi"
                        >
                          <img
                            src={opt.image}
                            alt={`Gambar Opsi ${String.fromCharCode(65 + optIdx)}`}
                            className="h-20 w-full object-contain rounded bg-slate-50"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ZoomIn className="w-3 h-3 text-[#D4AF37]" /> Zoom
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.questionType === 'complex_mc' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-semibold mb-1">Pilihan dengan tanda centang adalah kunci benar:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = Array.isArray(q.answerKey)
                        ? q.answerKey.includes(opt.id)
                        : opt.id === q.answerKey;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border text-xs font-medium flex flex-col gap-1.5 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            <span className="flex-1">{opt.text || <em className="text-slate-400 font-normal">(Tanpa teks)</em>}</span>
                          </div>
                          {opt.image && (
                            <div
                              onClick={() => setZoomImage(opt.image!)}
                              className="relative group mt-0.5 rounded-lg border border-slate-200 overflow-hidden bg-white p-1 cursor-pointer max-h-24 hover:border-[#071D49] transition-all"
                              title="Klik untuk memperbesar gambar opsi"
                            >
                              <img
                                src={opt.image}
                                alt={`Gambar Opsi ${String.fromCharCode(65 + optIdx)}`}
                                className="h-20 w-full object-contain rounded bg-slate-50"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                                <ZoomIn className="w-3 h-3 text-[#D4AF37]" /> Zoom
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {q.questionType === 'matching' && (
                <div className="space-y-1">
                  {q.matchingPairs?.map((pair) => (
                    <div key={pair.id} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">{pair.premise}</span>
                      <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {pair.response}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {q.questionType === 'true_false' && (
                <p className="text-xs font-bold text-emerald-700">
                  Kunci: {q.answerKey === 'tf_true' ? 'BENAR' : 'SALAH'}
                </p>
              )}

              {q.questionType === 'essay' && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-700">
                    <strong>Kata Kunci:</strong> {q.acceptedAnswers?.join(', ')}
                  </p>
                  {q.rubric && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Rubrik:</strong> {q.rubric}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingItem ? 'Edit Butir Soal' : 'Tambah Butir Soal CBT Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Soal <span className="text-red-500">*</span></label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-[#071D49]"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="complex_mc">Pilihan Ganda Kompleks</option>
                    <option value="matching">Menjodohkan</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="essay">Uraian / Isian Singkat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {subjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Soal</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={qWeight}
                    onChange={(e) => setQWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teks Pertanyaan / Soal <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan butir soal di sini..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#071D49] focus:outline-none"
                />
              </div>

              {/* Lampiran Gambar Soal (Opsional: Peta, Bangun Datar, Diagram, Tabel, dsb) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Lampiran Gambar Soal (Opsional)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Mendukung JPG, PNG, WebP (Maks. 3MB) atau Tautan URL
                  </span>
                </div>

                {/* Input Pilihan File & Input URL */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Unggah File dari Komputer / HP</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-slate-400 text-xs font-bold">atau</span>

                  <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        placeholder="Tempel tautan URL gambar..."
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#071D49] focus:outline-none bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      + Tambah URL
                    </button>
                  </div>
                </div>

                {/* Grid Pratinjau Gambar yang Terlampir */}
                {qImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {qImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs"
                      >
                        <img
                          src={imgSrc}
                          alt={`Gambar Soal ${idx + 1}`}
                          className="w-full h-24 object-contain bg-slate-100 p-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all cursor-pointer"
                          title="Hapus Gambar Ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="p-1 text-[10px] text-center font-bold text-slate-600 bg-slate-50 border-t border-slate-200">
                          Gambar #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic options configuration */}
              {(qType === 'multiple_choice' || qType === 'complex_mc') && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block font-bold text-slate-800 text-xs">
                      Opsi Pilihan Jawaban ({qType === 'complex_mc' ? 'Centang semua jawaban benar' : 'Pilih satu kunci jawaban benar'}):
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Setiap opsi (A, B, C, D) dapat menyertakan teks, gambar, atau keduanya
                    </span>
                  </div>

                  <div className="space-y-3">
                    {options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Row 1: Radio/Check + Badge + Text input + Actions */}
                          <div className="flex items-center gap-2">
                            <input
                              type={qType === 'complex_mc' ? 'checkbox' : 'radio'}
                              name="correct_choice"
                              title={`Jadikan Opsi ${letter} sebagai kunci jawaban`}
                              checked={opt.isCorrect}
                              onChange={(e) => {
                                if (qType === 'multiple_choice') {
                                  setOptions(options.map((o, idx) => ({ ...o, isCorrect: idx === i })));
                                } else {
                                  setOptions(options.map((o, idx) => (idx === i ? { ...o, isCorrect: e.target.checked } : o)));
                                }
                              }}
                              className="w-4 h-4 text-[#071D49] rounded cursor-pointer shrink-0"
                            />

                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {letter}
                            </span>

                            <input
                              type="text"
                              placeholder={`Teks pilihan ${letter} (opsional jika opsi hanya berupa gambar)...`}
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...options];
                                updated[i].text = e.target.value;
                                setOptions(updated);
                              }}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#071D49] focus:outline-none bg-white"
                            />

                            {/* Buttons to attach image for this option */}
                            <label
                              title={`Unggah file gambar dari komputer/HP untuk opsi ${letter}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
                            >
                              <Upload className="w-3 h-3 text-[#071D49]" />
                              <span className="hidden sm:inline">Upload Gambar</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleOptionFileUpload(i, e)}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setOptionUrlIndex(optionUrlIndex === i ? null : i);
                                setTempOptionUrl('');
                              }}
                              title={`Tautan URL gambar untuk opsi ${letter}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
                            >
                              <LinkIcon className="w-3 h-3 text-[#071D49]" />
                              <span className="hidden sm:inline">URL</span>
                            </button>
                          </div>

                          {/* URL input field if opened for this option */}
                          {optionUrlIndex === i && (
                            <div className="mt-2 pl-9 flex items-center gap-2">
                              <input
                                type="url"
                                placeholder={`Masukkan URL gambar untuk Opsi ${letter}...`}
                                value={tempOptionUrl}
                                onChange={(e) => setTempOptionUrl(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleApplyOptionUrl(i);
                                  }
                                }}
                                className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleApplyOptionUrl(i)}
                                className="px-3 py-1 bg-[#071D49] text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Terapkan
                              </button>
                              <button
                                type="button"
                                onClick={() => setOptionUrlIndex(null)}
                                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-bold"
                              >
                                Batal
                              </button>
                            </div>
                          )}

                          {/* Option Image Thumbnail & Controls */}
                          {opt.image && (
                            <div className="mt-2.5 pl-9 flex flex-wrap items-center gap-3">
                              <div className="relative group border border-slate-300 rounded-xl overflow-hidden bg-white p-1 shadow-xs max-w-[200px]">
                                <img
                                  src={opt.image}
                                  alt={`Gambar Opsi ${letter}`}
                                  className="h-20 w-36 object-contain rounded-lg bg-slate-50 cursor-pointer"
                                  onClick={() => setZoomImage(opt.image!)}
                                />
                                <div className="p-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-[#071D49]">Gambar Opsi {letter}</span>
                                  <button
                                    type="button"
                                    onClick={() => setZoomImage(opt.image!)}
                                    className="text-blue-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <ZoomIn className="w-3 h-3" /> Zoom
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveOptionImage(i)}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                title={`Hapus gambar opsi ${letter}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Gambar Opsi {letter}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {qType === 'matching' && (
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700">Pasangan Premis & Respon Menjodohkan:</label>
                  {matchingPairs.map((pair, idx) => (
                    <div key={pair.id} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={`Premis ${idx + 1} (Misal: Sayap Burung)`}
                        value={pair.premise}
                        onChange={(e) => {
                          const u = [...matchingPairs];
                          u[idx].premise = e.target.value;
                          setMatchingPairs(u);
                        }}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder={`Respon ${idx + 1} (Misal: Terbang di udara)`}
                        value={pair.response}
                        onChange={(e) => {
                          const u = [...matchingPairs];
                          u[idx].response = e.target.value;
                          setMatchingPairs(u);
                        }}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-emerald-800"
                      />
                    </div>
                  ))}
                </div>
              )}

              {qType === 'true_false' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-2">Kunci Jawaban Pernyataan:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={tfAnswer === 'tf_true'}
                        onChange={() => setTfAnswer('tf_true')}
                      />
                      BENAR
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-red-800">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={tfAnswer === 'tf_false'}
                        onChange={() => setTfAnswer('tf_false')}
                      />
                      SALAH
                    </label>
                  </div>
                </div>
              )}

              {qType === 'essay' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kata Kunci Jawaban yang Diterima:</label>
                    <input
                      type="text"
                      placeholder="Pisahkan dengan koma jika ada beberapa sinonim..."
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rubrik & Panduan Penilaian Guru:</label>
                    <textarea
                      rows={2}
                      placeholder="Pedoman skor untuk koreksi manual/otomatis..."
                      value={essayRubric}
                      onChange={(e) => setEssayRubric(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] shadow-md"
                >
                  Simpan ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <span className="font-bold text-xs uppercase text-[#071D49]">
                Pratinjau Soal CBT: {getTypeName(previewItem.questionType)}
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-wrap">{previewItem.questionText}</p>

            {/* Lampiran Gambar pada Pratinjau */}
            {previewItem.imageReferences && previewItem.imageReferences.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {previewItem.imageReferences.map((imgSrc, imgIdx) => (
                  <div
                    key={imgIdx}
                    onClick={() => setZoomImage(imgSrc)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer max-h-48"
                  >
                    <img
                      src={imgSrc}
                      alt={`Pratinjau Gambar ${imgIdx + 1}`}
                      className="max-h-48 w-auto object-contain p-1"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <ZoomIn className="w-4 h-4 text-[#D4AF37]" /> Klik Perbesar
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={`grid ${previewItem.options?.some((o) => !!o.image) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
              {previewItem.options?.map((opt, i) => (
                <div key={opt.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#071D49] text-white font-black flex items-center justify-center text-[10px] shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-semibold text-slate-800">{opt.text || <em className="text-slate-400 font-normal">(Opsi {String.fromCharCode(65 + i)})</em>}</span>
                  </div>
                  {opt.image && (
                    <div
                      onClick={() => setZoomImage(opt.image!)}
                      className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50 cursor-pointer p-1"
                    >
                      <img
                        src={opt.image}
                        alt={`Pratinjau Opsi ${String.fromCharCode(65 + i)}`}
                        className="h-24 w-full object-contain rounded"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" /> Klik Zoom
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-[#071D49] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Image Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full z-10 transition-all cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Perbesaran Gambar Soal"
              className="max-w-full max-h-[82vh] object-contain rounded-xl mx-auto"
            />
            <p className="text-center text-xs text-slate-500 font-bold py-2">
              Pratinjau Resolusi Tinggi Gambar Soal SD Xaverius A1
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
