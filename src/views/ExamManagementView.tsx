/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Exam, Subject, SchoolClass, QuestionBankItem } from '../types';
import {
  CalendarCheck,
  Plus,
  Pencil,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Copy,
  Check,
  X,
  Sparkles,
  Info,
  Share2,
  ExternalLink,
  MessageSquare,
  Link as LinkIcon,
} from 'lucide-react';

interface ParsedExamRow {
  examName: string;
  subjectRaw: string;
  subjectId: string;
  subjectName: string;
  classRaw: string;
  classIds: string[];
  startTime: string;
  endTime: string;
  duration: number;
  token: string;
  status: 'active' | 'draft';
  questionCount: number;
  questionIds: string[];
  isValid: boolean;
  notes?: string;
}

export const ExamManagementView: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');

  // Single Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form State
  const [examName, setExamName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [token, setToken] = useState('XAV6A');
  const [status, setStatus] = useState<'draft' | 'published' | 'active' | 'completed'>('active');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Import Schedule Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedExamRow[]>([]);
  const [importStatusOverride, setImportStatusOverride] = useState<'active' | 'draft'>('active');
  const [importLoading, setImportLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Share Exam Modal State
  const [sharingExam, setSharingExam] = useState<Exam | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareWaCopied, setShareWaCopied] = useState(false);

  const getExamDirectUrl = (ex: Exam) => {
    return `${window.location.origin}${window.location.pathname}?exam=${ex.examId}&token=${ex.token || ''}`;
  };

  const getWhatsAppBroadcastText = (ex: Exam) => {
    const url = getExamDirectUrl(ex);
    const classesText =
      ex.classIds && ex.classIds.length > 0
        ? ex.classIds.map((c) => c.replace('cls_', '').toUpperCase()).join(', ')
        : 'Semua Rombel';

    return (
      `📢 *PENGUMUMAN JADWAL UJIAN CBT - SD XAVERIUS A1 AMBON*\n\n` +
      `📖 *Nama Ujian:* ${ex.examName}\n` +
      `🏫 *Rombel Kelas:* ${classesText}\n` +
      `⏱️ *Alokasi Waktu:* ${ex.duration} Menit\n` +
      `🔑 *Token Ujian:* *${ex.token}*\n\n` +
      `Klik tautan resmi di bawah ini untuk langsung mengikuti ujian:\n` +
      `👉 ${url}\n\n` +
      `_Petunjuk Siswa: Masuk menggunakan akun siswa yang telah terdaftar, masukkan token, dan kerjakan secara mandiri serta jujur._`
    );
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [examRes, masterRes, qbRes] = await Promise.all([
        api.exams.getAll(),
        api.master.getAll(),
        api.questionBanks.getAll(),
      ]);
      setExams(examRes.exams || []);
      setSubjects(masterRes.subjects || []);
      setClasses(masterRes.classes || []);
      setQuestions(qbRes.questions || []);
    } catch (e) {
      console.error('Failed to load exams', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setExamName('');
    setSubjectId(subjects[0]?.subjectId || 'sbj_ipas');
    setSelectedClassIds(classes.length > 0 ? [classes[0].classId] : ['cls_6a']);
    setDuration(60);
    setToken(Math.random().toString(36).substring(2, 7).toUpperCase());
    setStatus('active');
    // Default link questions for this subject
    const defaultSubj = subjects[0]?.subjectId || 'sbj_ipas';
    setSelectedQuestionIds(questions.filter((q) => q.subjectId === defaultSubj).map((q) => q.questionId));
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setExamName(exam.examName);
    setSubjectId(exam.subjectId);
    setSelectedClassIds(exam.classIds || []);
    setDuration(exam.duration || 60);
    setToken(exam.token || 'XAV6A');
    setStatus(exam.status as any);
    setSelectedQuestionIds(exam.questionIds || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      alert('Nama ujian wajib diisi.');
      return;
    }

    const payload: Partial<Exam> = {
      examName,
      subjectId,
      subjectName: subjects.find((s) => s.subjectId === subjectId)?.subjectName,
      classIds: selectedClassIds,
      duration: Number(duration),
      token: token.trim().toUpperCase(),
      status,
      questionIds: selectedQuestionIds,
      totalWeight: 100,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    };

    try {
      if (editingExam) {
        await api.exams.update(editingExam.examId, payload);
      } else {
        await api.exams.create(payload);
      }
      setIsModalOpen(false);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan paket ujian.');
    }
  };

  const handleDeleteExam = async (examId: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jadwal ujian "${name}"?`)) return;
    try {
      await api.exams.delete(examId);
      loadAll();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus jadwal ujian.');
    }
  };

  const handleToggleStatus = async (exam: Exam) => {
    const nextStatus = exam.status === 'active' ? 'draft' : 'active';
    try {
      await api.exams.update(exam.examId, { status: nextStatus });
      loadAll();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status ujian.');
    }
  };

  const generateNewToken = () => {
    setToken(Math.random().toString(36).substring(2, 7).toUpperCase());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // ==========================================
  // TEMPLATE DOWNLOAD LOGIC (Excel .xlsx / .xml)
  // ==========================================
  const handleDownloadTemplate = (format: 'xlsx' | 'xml' = 'xlsx') => {
    const headers = [
      'Nama Ujian',
      'Mata Pelajaran (Nama atau Kode)',
      'Kelas Target (Pisahkan Koma)',
      'Tanggal & Jam Mulai (YYYY-MM-DD HH:MM)',
      'Tanggal & Jam Selesai (YYYY-MM-DD HH:MM)',
      'Durasi (Menit)',
      'Token Akses (Kosongkan utk Acak)',
      'Status (active/draft)',
    ];

    const sampleRows = [
      ['Asesmen Sumatif Akhir Jenjang - IPAS', 'Ilmu Pengetahuan Alam & Sosial (IPAS)', '6A, 6B', '2026-11-10 08:00', '2026-11-10 10:00', 60, 'XAV6A', 'active'],
      ['Penilaian Akhir Semester - Matematika', 'Matematika', '6A, 6B', '2026-11-11 08:00', '2026-11-11 10:00', 90, 'MAT6A', 'active'],
      ['Asesmen Sumatif Semester - Bahasa Indonesia', 'Bahasa Indonesia', '5A, 5B', '2026-11-12 08:00', '2026-11-12 09:30', 60, 'BIN5A', 'active'],
      ['Asesmen Sumatif Semester - Matematika', 'Matematika', '4A, 4B', '2026-11-13 08:00', '2026-11-13 09:30', 60, 'MAT4A', 'active'],
      ['Penilaian Tengah Semester - IPAS', 'Ilmu Pengetahuan Alam & Sosial (IPAS)', '3A, 3B', '2026-11-14 08:00', '2026-11-14 09:15', 60, 'IPA3A', 'active'],
      ['Penilaian Harian - Matematika', 'Matematika', '2A, 2B', '2026-11-15 08:00', '2026-11-15 09:00', 60, 'MAT2A', 'active'],
      ['Penilaian Harian Tematik - Agama Katolik', 'Pendidikan Agama Katolik & Budi Pekerti', '1A, 1B', '2026-11-16 08:00', '2026-11-16 09:00', 45, 'PAK1A', 'active'],
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Daftar_Jadwal
    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 44 }, // Nama Ujian
      { wch: 46 }, // Mata Pelajaran
      { wch: 24 }, // Kelas Target
      { wch: 28 }, // Tanggal & Jam Mulai
      { wch: 28 }, // Tanggal & Jam Selesai
      { wch: 18 }, // Durasi (Menit)
      { wch: 22 }, // Token Akses
      { wch: 18 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar_Jadwal');

    // Sheet 2: Petunjuk & Referensi Master Data Sekolah (12 Rombel Lengkap)
    const petunjukData = [
      ['PANDUAN PENGISIAN TEMPLATE DAFTAR JADWAL UJIAN - SD XAVERIUS A1 AMBON'],
      ['TAHUN AJARAN 2024/2025 • 12 ROMBEL (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B)'],
      [''],
      ['No', 'Nama Kolom', 'Ketentuan Pengisian', 'Contoh Nilai'],
      ['1', 'Nama Ujian', 'Wajib diisi dengan nama lengkap evaluasi/ujian.', 'Penilaian Akhir Semester - IPAS Kelas 6'],
      ['2', 'Mata Pelajaran', 'Isi nama lengkap mapel atau kode mapel terdaftar.', 'IPAS atau Ilmu Pengetahuan Alam dan Sosial'],
      ['3', 'Kelas Target', 'Isi satu atau beberapa dari 12 rombel (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B).', '6A, 6B'],
      ['4', 'Tanggal & Jam Mulai', 'Format: YYYY-MM-DD HH:MM (Tahun-Bulan-Hari Jam:Menit).', '2026-11-10 08:00'],
      ['5', 'Tanggal & Jam Selesai', 'Format: YYYY-MM-DD HH:MM (Tahun-Bulan-Hari Jam:Menit).', '2026-11-10 10:00'],
      ['6', 'Durasi (Menit)', 'Lama pengerjaan dalam satuan menit (angka saja).', '60'],
      ['7', 'Token Akses', 'Kode token unik CBT. Kosongkan jika ingin dibuat acak otomatis.', 'XAV6A (atau kosongkan)'],
      ['8', 'Status', 'Ketik "active" untuk langsung dijalankan, atau "draft" untuk draf.', 'active atau draft'],
      [''],
      ['DAFTAR MATA PELAJARAN TERSEDIA DI SISTEM:'],
      ['Kode Mapel', 'Nama Mata Pelajaran Resmi'],
      ...subjects.map((s) => [s.subjectCode, s.subjectName]),
      [''],
      ['DAFTAR 12 ROMBEL KELAS TERSEDIA DI SISTEM:'],
      ['ID Kelas', 'Nama Rombel'],
      ...classes.map((c) => [c.classId, c.className]),
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [
      { wch: 8 },
      { wch: 32 },
      { wch: 60 },
      { wch: 42 },
    ];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Referensi');

    if (format === 'xml') {
      const xmlContent = XLSX.write(wb, { bookType: 'xlml', type: 'string' });
      const blob = new Blob([xmlContent], {
        type: 'application/vnd.ms-excel;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Daftar_Jadwal_Ujian_SD_Xaverius_A1.xml');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Daftar_Jadwal_Ujian_SD_Xaverius_A1.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // ==========================================
  // PARSE MATRIX OF ROWS (EXCEL .XLTX OR CSV)
  // ==========================================
  const parseRowsMatrix = (matrix: any[][]) => {
    if (!matrix || matrix.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine if first row is a header
    const firstRow = matrix[0].map((cell) => String(cell ?? '').trim().toLowerCase());
    const isHeader = firstRow.some(
      (cell) =>
        cell.includes('nama') ||
        cell.includes('ujian') ||
        cell.includes('mapel') ||
        cell.includes('mata pelajaran') ||
        cell.includes('jadwal')
    );

    const dataRows = isHeader ? matrix.slice(1) : matrix;

    const parsed: ParsedExamRow[] = dataRows
      .filter((row) => row && row.some((c) => String(c ?? '').trim().length > 0))
      .map((cols, idx) => {
        const rawName = String(cols[0] ?? '').trim() || `Ujian CBT Baru #${idx + 1}`;
        const rawSubject = String(cols[1] ?? '').trim();
        const rawClasses = String(cols[2] ?? '').trim() || '6A';
        const rawStart = String(cols[3] ?? '').trim() || new Date().toISOString();
        const rawEnd = String(cols[4] ?? '').trim() || new Date(Date.now() + 86400000 * 3).toISOString();
        const rawDuration = parseInt(String(cols[5] ?? '60').replace(/[^0-9]/g, ''), 10) || 60;
        const rawToken = (String(cols[6] ?? '').trim() || Math.random().toString(36).substring(2, 7)).toUpperCase();
        const rawStatus = String(cols[7] ?? importStatusOverride).toLowerCase().includes('draft')
          ? 'draft'
          : 'active';

        // Match subject against school master data
        const matchedSubject = subjects.find(
          (s) =>
            s.subjectName.toLowerCase().includes(rawSubject.toLowerCase()) ||
            rawSubject.toLowerCase().includes(s.subjectName.toLowerCase()) ||
            s.subjectCode.toLowerCase() === rawSubject.toLowerCase() ||
            s.subjectId.toLowerCase() === rawSubject.toLowerCase()
        ) || subjects[0];

        // Match classes
        const matchedClassIds: string[] = [];
        const classTokens = rawClasses.split(/[,/|;]/).map((c) => c.trim().toLowerCase());
        classes.forEach((cl) => {
          const cName = cl.className.toLowerCase();
          const cId = cl.classId.toLowerCase();
          if (
            classTokens.some((tok) => tok && (cName.includes(tok) || tok.includes(cName) || cId.includes(tok)))
          ) {
            matchedClassIds.push(cl.classId);
          }
        });

        // Default to first class if nothing matched
        if (matchedClassIds.length === 0 && classes.length > 0) {
          matchedClassIds.push(classes[0].classId);
        }

        // Link questions belonging to this subject
        const linkedQuestions = questions.filter(
          (q) => matchedSubject && q.subjectId === matchedSubject.subjectId
        );
        const questionIds =
          linkedQuestions.length > 0 ? linkedQuestions.map((q) => q.questionId) : questions.map((q) => q.questionId);

        const isValid = rawName.length > 0 && !!matchedSubject;

        return {
          examName: rawName,
          subjectRaw: rawSubject,
          subjectId: matchedSubject?.subjectId || 'sbj_ipas',
          subjectName: matchedSubject?.subjectName || 'IPAS',
          classRaw: rawClasses,
          classIds: matchedClassIds,
          startTime: rawStart,
          endTime: rawEnd,
          duration: rawDuration,
          token: rawToken,
          status: rawStatus,
          questionCount: questionIds.length,
          questionIds,
          isValid,
          notes:
            linkedQuestions.length === 0
              ? 'Menggunakan semua butir soal yang tersedia di bank soal'
              : undefined,
        };
      });

    setParsedRows(parsed);
  };

  // ==========================================
  // PARSE TEXT (CSV / TSV / TEXT PASTE)
  // ==========================================
  const parseScheduleText = (text: string) => {
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const firstLine = lines[0];
    let delimiter = ',';
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;

    if (semicolons > commas && semicolons >= tabs) delimiter = ';';
    else if (tabs > commas && tabs > semicolons) delimiter = '\t';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const matrix = lines.map(parseLine);
    parseRowsMatrix(matrix);
  };

  // ==========================================
  // HANDLE FILE UPLOAD (.XML, .XLSX, .XLTX, .CSV)
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcelOrXml =
      fileName.endsWith('.xml') ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xltx') ||
      fileName.endsWith('.xls') ||
      file.type.includes('xml') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel');

    if (isExcelOrXml) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const targetSheetName =
            workbook.SheetNames.find((name) =>
              name.toLowerCase().includes('jadwal')
            ) || workbook.SheetNames[0];

          const worksheet = workbook.Sheets[targetSheetName];
          const matrix = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as any[][];

          parseRowsMatrix(matrix);

          // Render tab-separated preview in textarea
          const textPreview = matrix
            .map((row) => row.join('\t'))
            .filter((line) => line.trim().length > 0)
            .join('\n');
          setImportText(textPreview);
        } catch (err: any) {
          alert('Gagal membaca file Excel XML (.xml). Pastikan file tidak rusak.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setImportText(content);
          parseScheduleText(content);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleRemoveParsedRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      alert('Belum ada jadwal yang siap diimpor.');
      return;
    }

    setImportLoading(true);
    try {
      const payloadExams: Partial<Exam>[] = parsedRows.map((row) => ({
        examName: row.examName,
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        classIds: row.classIds,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        token: row.token,
        status: importStatusOverride,
        questionIds: row.questionIds,
        totalWeight: 100,
      }));

      const res = await api.exams.bulkImport(payloadExams);
      alert(
        `Sukses! ${res.count || payloadExams.length} jadwal ujian berhasil diimpor dan siap dijalankan.`
      );
      setIsImportModalOpen(false);
      setImportText('');
      setParsedRows([]);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor jadwal ujian.');
    } finally {
      setImportLoading(false);
    }
  };

  // Filter exams
  const filteredExams = exams.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#071D49]">
              <CalendarCheck className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h2 className="text-lg font-black text-[#071D49]">
              Manajemen Paket & Jadwal Ujian CBT
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kelola sesi ujian, alokasi waktu, token akses, atau gunakan fitur <strong>Unduh & Impor Template Jadwal</strong> untuk menjadwalkan seluruh ujian sekolah secara massal.
          </p>
        </div>

        {/* Action Buttons: Template, Import, Create */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadTemplate('xlsx')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-emerald-300 shadow-2xs cursor-pointer"
            title="Unduh template resmi Microsoft Excel biasa (.xlsx) berisi 12 rombel untuk diisi manual"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Unduh Template (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownloadTemplate('xml')}
            className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
            title="Unduh template format Microsoft Excel XML Spreadsheet (.xml)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh (.xml)</span>
          </button>

          <button
            onClick={() => {
              setIsImportModalOpen(true);
              if (importText) parseScheduleText(importText);
            }}
            className="px-3.5 py-2.5 bg-[#5BA5D5] hover:bg-[#4A94C4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            title="Unggah template Excel XML (.xml) yang sudah diisi manual"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Unggah & Impor Jadwal</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Buat Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#071D49] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Jadwal ({exams.length})
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Sedang Aktif ({exams.filter((e) => e.status === 'active').length})</span>
        </button>

        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            statusFilter === 'draft'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Draf ({exams.filter((e) => e.status === 'draft').length})
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Selesai ({exams.filter((e) => e.status === 'completed').length})
        </button>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada jadwal ujian ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Gunakan tombol <strong>"Unduh Template (.CSV)"</strong> untuk mengisi jadwal beberapa ujian sekaligus, lalu unggah kembali untuk menjalankan ujian siswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((ex) => (
            <div
              key={ex.examId}
              className={`bg-white p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                ex.status === 'active'
                  ? 'border-emerald-300 ring-2 ring-emerald-100 hover:border-emerald-500'
                  : 'border-slate-200 hover:border-[#D4AF37]'
              }`}
            >
              <div>
                {/* Top Row: Status Pill & Token Copy */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                      ex.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        ex.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                      }`}
                    ></span>
                    <span>{ex.status === 'active' ? 'Sedang Aktif (Berjalan)' : ex.status}</span>
                  </span>

                  <button
                    onClick={() => copyToClipboard(ex.token)}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 font-mono text-xs font-bold text-amber-900 cursor-pointer transition-colors"
                    title="Klik untuk menyalin token ujian"
                  >
                    <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Token: <strong>{ex.token}</strong></span>
                    {copiedToken === ex.token ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-black text-[#071D49] mb-1 line-clamp-1">{ex.examName}</h3>
                <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5BA5D5]"></span>
                  <span>{ex.subjectName || 'IPAS'}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#5BA5D5]" />
                    <span>
                      Durasi: <strong>{ex.duration} Menit</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      Soal: <strong>{ex.questionIds?.length || 0} Butir</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-400">
                  Kelas: {ex.classIds?.join(', ') || 'Semua'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(ex)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      ex.status === 'active'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                    title={ex.status === 'active' ? 'Jeda pelaksanaan ujian' : 'Jalankan / Aktifkan ujian sekarang'}
                  >
                    {ex.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3" /> Jeda
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Jalankan
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSharingExam(ex);
                      setShareLinkCopied(false);
                      setShareWaCopied(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#071D49] border border-blue-200 transition-all cursor-pointer shadow-2xs"
                    title="Bagikan tautan langsung ujian ke siswa / grup WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#5BA5D5]" />
                    <span>Link Ujian</span>
                  </button>

                  <button
                    onClick={() => openEditModal(ex)}
                    className="p-1.5 text-slate-600 hover:text-[#071D49] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit konfigurasi jadwal"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteExam(ex.examId, ex.examName)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus jadwal ujian"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
          MODAL 1: IMPOR DAFTAR JADWAL UJIAN
         ========================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Unggah & Impor Daftar Jadwal Ujian (Excel XML)</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Petunjuk Penggunaan */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-300/70 rounded-2xl flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#071D49]">Cara Mengisi dan Mengunggah Jadwal (Excel XML):</h4>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 leading-relaxed">
                    <li>
                      Klik tombol <strong>"Unduh Template (Excel XML)"</strong>. Anda akan mendapatkan file <code>Template_Daftar_Jadwal_Ujian_SD_Xaverius_A1.xml</code>.
                    </li>
                    <li>
                      Buka file tersebut di <strong>Microsoft Excel</strong>. Format Excel XML Spreadsheet 2003 ini langsung terbuka di Excel dengan 2 sheet: <em>Daftar_Jadwal</em> (lembar kerja pengisian) dan <em>Petunjuk_Referensi</em> (referensi kode mapel & rombel kelas resmi).
                    </li>
                    <li>
                      Isi baris jadwal ujian sesuai kalender akademik (nama ujian, mata pelajaran, rombel kelas, jam mulai/selesai, dan durasi).
                    </li>
                    <li>
                      Simpan file Anda (format <strong>.xml</strong> atau <strong>.xlsx</strong>), lalu unggah file tersebut di kotak sebelah kiri di bawah.
                    </li>
                    <li>
                      Periksa tabel pratinjau hasil pembacaan sistem, lalu klik <strong>"Simpan & Jalankan Semua Jadwal"</strong>.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload File Input */}
                <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-5 text-center flex flex-col items-center justify-center bg-emerald-50/30 transition-all">
                  <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                  <p className="font-bold text-slate-800 mb-0.5">Pilih File Template Jadwal</p>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] mb-2">
                    Excel XML Spreadsheet (*.xml)
                  </span>
                  <p className="text-[11px] text-slate-400 mb-3">Mendukung file .xml (Excel XML), .xlsx, .xltx, atau .csv</p>
                  <label className="px-4 py-2 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Pilih File Excel XML (.xml)</span>
                    <input
                      type="file"
                      accept=".xml, .xlsx, .xltx, .xls, .csv, .txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Paste Text / Quick Actions */}
                <div className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 block">Atau Salin-Tempel Baris Data Excel di Sini:</label>
                    <textarea
                      rows={4}
                      value={importText}
                      onChange={(e) => {
                        setImportText(e.target.value);
                        parseScheduleText(e.target.value);
                      }}
                      placeholder="Tempel baris tabel yang disalin langsung dari Excel di sini..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-[11px] font-mono focus:ring-1 focus:ring-[#071D49] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Template .xlsx
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xml')}
                        className="text-xs font-semibold text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh .xml
                      </button>
                    </div>
                    {importText && (
                      <button
                        type="button"
                        onClick={() => {
                          setImportText('');
                          setParsedRows([]);
                        }}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Default Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">
                    Status Pelaksanaan Setelah Diimpor:
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Pilih apakah jadwal langsung aktif berjalan atau disimpan sebagai draf
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-emerald-300">
                  <button
                    type="button"
                    onClick={() => setImportStatusOverride('active')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      importStatusOverride === 'active'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Langsung Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportStatusOverride('draft')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      importStatusOverride === 'draft'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sebagai Draf
                  </button>
                </div>
              </div>

              {/* Preview Table of Parsed Schedule Rows */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071D49] text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      Pratinjau Hasil Pembacaan ({parsedRows.length} Jadwal Terdeteksi):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Semua jadwal siap disimpan dan dijalankan
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-[#071D49] text-white sticky top-0">
                        <tr>
                          <th className="p-2.5 font-bold">No</th>
                          <th className="p-2.5 font-bold">Nama Paket Ujian</th>
                          <th className="p-2.5 font-bold">Mata Pelajaran</th>
                          <th className="p-2.5 font-bold">Kelas</th>
                          <th className="p-2.5 font-bold">Durasi</th>
                          <th className="p-2.5 font-bold">Token</th>
                          <th className="p-2.5 font-bold">Soal Bank</th>
                          <th className="p-2.5 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-[#071D49] max-w-[180px] truncate">
                              {row.examName}
                            </td>
                            <td className="p-2.5 text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#071D49] font-bold text-[10px]">
                                {row.subjectName}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{row.classIds.join(', ')}</td>
                            <td className="p-2.5 font-semibold text-slate-700">{row.duration} Mnt</td>
                            <td className="p-2.5 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded">
                              {row.token}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-600">
                              {row.questionCount} Butir
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveParsedRow(idx)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Batalkan baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0 || importLoading}
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importLoading ? (
                    <span>Sedang Mengimpor...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>Simpan & Jalankan {parsedRows.length} Jadwal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: BUAT / EDIT SATUAN JADWAL UJIAN
         ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingExam ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Paket Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PAS Semester Ganjil - IPAS Kelas VI"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold focus:ring-1 focus:ring-[#071D49] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const newSubj = e.target.value;
                      setSubjectId(newSubj);
                      // Auto select matching questions
                      setSelectedQuestionIds(
                        questions.filter((q) => q.subjectId === newSubj).map((q) => q.questionId)
                      );
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-1 focus:ring-[#071D49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Token Akses CBT</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-black text-[#071D49]"
                    />
                    <button
                      type="button"
                      onClick={generateNewToken}
                      className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
                      title="Acak Token Baru"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pelaksanaan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="active">Aktif (Dapat Dikerjakan Siswa)</option>
                    <option value="draft">Draf (Belum Terbit)</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Class Selection Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Kelas Target Peserta:
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => {
                    const isChecked = selectedClassIds.includes(cls.classId);
                    return (
                      <label
                        key={cls.classId}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-[#071D49] text-white border-[#071D49]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassIds([...selectedClassIds, cls.classId]);
                            } else {
                              setSelectedClassIds(selectedClassIds.filter((id) => id !== cls.classId));
                            }
                          }}
                          className="hidden"
                        />
                        <span>{cls.className}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Question Selection Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Pilih Butir Soal dari Bank Soal ({selectedQuestionIds.length} butir terpilih):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedQuestionIds.length === questions.length) {
                        setSelectedQuestionIds([]);
                      } else {
                        setSelectedQuestionIds(questions.map((q) => q.questionId));
                      }
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {selectedQuestionIds.length === questions.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50">
                  {questions.length === 0 ? (
                    <p className="text-center text-slate-400 py-3">Bank soal masih kosong.</p>
                  ) : (
                    questions.map((q) => (
                      <label
                        key={q.questionId}
                        className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white text-xs cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(q.questionId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionIds([...selectedQuestionIds, q.questionId]);
                            } else {
                              setSelectedQuestionIds(
                                selectedQuestionIds.filter((id) => id !== q.questionId)
                              );
                            }
                          }}
                          className="mt-0.5 rounded text-[#071D49]"
                        />
                        <div className="line-clamp-1 flex-1 font-medium text-slate-700">
                          <span className="font-bold text-[#071D49] mr-1">[{q.questionType}]</span>
                          <span>{q.questionText}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] shadow-md cursor-pointer"
                >
                  Simpan Jadwal Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BAGIKAN LINK UJIAN LANGSUNG & PESAN WHATSAPP      */}
      {/* ======================================================== */}
      {sharingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#071D49] to-[#0A2255] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Share2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Bagikan Tautan Langsung Ujian Siswa</h3>
                  <p className="text-[11px] text-slate-300">
                    Kirim link ini ke siswa atau grup WhatsApp kelas untuk langsung memulai ujian
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSharingExam(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Exam Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {sharingExam.status === 'active' ? 'Ujian Aktif' : sharingExam.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#071D49] bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                    Token: <strong>{sharingExam.token}</strong>
                  </span>
                </div>
                <h4 className="text-base font-black text-[#071D49]">{sharingExam.examName}</h4>
                <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                  <span>
                    Mata Pelajaran: <strong>{sharingExam.subjectName || 'IPAS'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Durasi: <strong>{sharingExam.duration} Menit</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Kelas: <strong>{sharingExam.classIds?.join(', ') || '12 Rombel'}</strong>
                  </span>
                </div>
              </div>

              {/* 1. Direct URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#5BA5D5]" />
                  <span>1. Tautan Langsung Siswa (Direct URL Link)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getExamDirectUrl(sharingExam)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getExamDirectUrl(sharingExam));
                      setShareLinkCopied(true);
                      setTimeout(() => setShareLinkCopied(false), 2500);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      shareLinkCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#071D49] hover:bg-[#0A2255] text-white shadow-xs'
                    }`}
                  >
                    {shareLinkCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#D4AF37]" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Saat siswa mengklik link ini, ujian dan token akan terpilih otomatis saat siswa masuk.
                </p>
              </div>

              {/* 2. WhatsApp Broadcast Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Format Pesan WhatsApp Siap Kirim</span>
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getWhatsAppBroadcastText(sharingExam));
                      setShareWaCopied(true);
                      setTimeout(() => setShareWaCopied(false), 2500);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {shareWaCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{shareWaCopied ? 'Pesan Tersalin!' : 'Salin Teks WhatsApp'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={5}
                  value={getWhatsAppBroadcastText(sharingExam)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-mono text-slate-700 leading-relaxed focus:outline-none"
                />
              </div>

              {/* 3. QR Code & Tips */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl border border-blue-200 shadow-2xs shrink-0 text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(getExamDirectUrl(sharingExam))}`}
                    alt="QR Code Ujian"
                    className="w-20 h-20 mx-auto"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-500 mt-1 block">Scan Kamera HP</span>
                </div>
                <div className="text-[11px] text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Sekolah Tidak Perlu Membuat Website Terpisah!
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Aplikasi <strong>XAVERIUS EXAM</strong> ini sudah berjalan online 24 jam di cloud Google. Tautan ini dapat langsung dibuka di komputer lab sekolah, laptop guru, maupun smartphone siswa tanpa perlu sewa domain atau web hosting lain.
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    💡 <em>Tips:</em> Buat shortcut atau simpan (bookmark) link ini di browser Google Chrome komputer lab sekolah agar siswa tinggal klik 1 kali.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppBroadcastText(sharingExam))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Langsung via WhatsApp</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.open(getExamDirectUrl(sharingExam), '_blank');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Uji Buka Tautan</span>
                  </button>
                  <button
                    onClick={() => setSharingExam(null)}
                    className="px-4 py-2 bg-[#071D49] text-white rounded-xl font-bold hover:bg-[#0A2255] cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
