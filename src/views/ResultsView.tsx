/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Result, SchoolClass, Subject, SchoolSettings } from '../types';
import * as XLSX from 'xlsx';
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode2,
  Users,
  School,
  ChevronDown,
  Check,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  X,
  BookOpen,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Percent,
  CheckCheck,
} from 'lucide-react';

interface RombelOption {
  code: string;
  label: string;
  full: string;
  grade: string;
}

const ROMBEL_OPTIONS: RombelOption[] = [
  { code: 'ALL', label: 'Semua Rombel', full: 'Semua Rombel (1A - 6B)', grade: 'Semua' },
  { code: '1A', label: 'Kelas 1A', full: 'Kelas I-A', grade: 'Kelas I' },
  { code: '1B', label: 'Kelas 1B', full: 'Kelas I-B', grade: 'Kelas I' },
  { code: '2A', label: 'Kelas 2A', full: 'Kelas II-A', grade: 'Kelas II' },
  { code: '2B', label: 'Kelas 2B', full: 'Kelas II-B', grade: 'Kelas II' },
  { code: '3A', label: 'Kelas 3A', full: 'Kelas III-A', grade: 'Kelas III' },
  { code: '3B', label: 'Kelas 3B', full: 'Kelas III-B', grade: 'Kelas III' },
  { code: '4A', label: 'Kelas 4A', full: 'Kelas IV-A', grade: 'Kelas IV' },
  { code: '4B', label: 'Kelas 4B', full: 'Kelas IV-B', grade: 'Kelas IV' },
  { code: '5A', label: 'Kelas 5A', full: 'Kelas V-A', grade: 'Kelas V' },
  { code: '5B', label: 'Kelas 5B', full: 'Kelas V-B', grade: 'Kelas V' },
  { code: '6A', label: 'Kelas 6A', full: 'Kelas VI-A', grade: 'Kelas VI' },
  { code: '6B', label: 'Kelas 6B', full: 'Kelas VI-B', grade: 'Kelas VI' },
];

const DEFAULT_HOMEROOM_TEACHERS: Record<string, { name: string; nip: string }> = {
  '1A': { name: 'Yohana Fransiska, S.Pd.', nip: '198205122008012003' },
  '1B': { name: 'Theresia Latuheru, S.Pd.', nip: '198402152009022005' },
  '2A': { name: 'Maria Renyaan, S.Pd.', nip: '198607182010012008' },
  '2B': { name: 'Andreas Silooy, S.Pd.', nip: '198003112005011004' },
  '3A': { name: 'Christina Pattiasina, S.Pd.', nip: '198711202011012006' },
  '3B': { name: 'Gabriel Tupamahu, S.Pd.', nip: '198309142007011005' },
  '4A': { name: 'Kezia Wattimena, S.Pd.', nip: '198904252014022002' },
  '4B': { name: 'Michael de Fretes, S.Pd.', nip: '198112192006041003' },
  '5A': { name: 'Elisabeth Manuhutu, S.Pd.', nip: '198506162009032007' },
  '5B': { name: 'Yohanes Latuconsina, S.Pd.', nip: '198208222008011006' },
  '6A': { name: 'Angela Merici Louhenapessy, S.Pd.', nip: '197801102002122001' },
  '6B': { name: 'Fransiskus Xaverius Sahertian, S.Pd.', nip: '197904032003121002' },
};

export const ResultsView: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'TUNTAS' | 'REMEDIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [kkm, setKkm] = useState<number>(75);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailResult, setActiveDetailResult] = useState<Result | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resResults, resMaster] = await Promise.all([
        api.results.getAll().catch(() => ({ success: false, results: [] })),
        api.master.getAll().catch(() => ({
          students: [],
          teachers: [],
          classes: [],
          subjects: [],
          schoolSettings: {
            schoolName: 'SD XAVERIUS A1 AMBON',
            schoolAddress: 'Jl. Pattimura No. 1, Kota Ambon, Maluku',
            schoolLogo: '',
            academicYear: '2024/2025',
            semester: 'Genap' as 'Ganjil' | 'Genap',
            contactInformation: 'Telp: (0911) 352211',
            headmasterName: 'Dra. Maria Regina, S.Pd.',
            headmasterNip: '197003151995122001',
          },
        })),
      ]);

      setResults(resResults.results || []);
      setClasses(resMaster.classes || []);
      setSubjects(resMaster.subjects || []);
      setSchoolSettings(resMaster.schoolSettings || null);
    } catch (e) {
      console.error('Failed to load results and master data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to normalize and detect Rombel code (1A - 6B) from Result record
  const getRombelCode = (r: Result): string => {
    const textToScan = `${r.className || ''} ${r.examName || ''} ${r.studentName || ''}`;
    if (/I-A\b|1A\b|1-A\b/i.test(textToScan)) return '1A';
    if (/I-B\b|1B\b|1-B\b/i.test(textToScan)) return '1B';
    if (/II-A\b|2A\b|2-A\b/i.test(textToScan)) return '2A';
    if (/II-B\b|2B\b|2-B\b/i.test(textToScan)) return '2B';
    if (/III-A\b|3A\b|3-A\b/i.test(textToScan)) return '3A';
    if (/III-B\b|3B\b|3-B\b/i.test(textToScan)) return '3B';
    if (/IV-A\b|4A\b|4-A\b/i.test(textToScan)) return '4A';
    if (/IV-B\b|4B\b|4-B\b/i.test(textToScan)) return '4B';
    if (/V-A\b|5A\b|5-A\b/i.test(textToScan)) return '5A';
    if (/V-B\b|5B\b|5-B\b/i.test(textToScan)) return '5B';
    if (/VI-A\b|6A\b|6-A\b/i.test(textToScan)) return '6A';
    if (/VI-B\b|6B\b|6-B\b/i.test(textToScan)) return '6B';
    return '6A'; // default fallback
  };

  const getRombelFullName = (rombelCode: string): string => {
    const found = ROMBEL_OPTIONS.find((r) => r.code === rombelCode);
    return found ? found.full : `Kelas ${rombelCode}`;
  };

  const getHomeroomTeacherInfo = (rombelCode: string) => {
    // Check if classes has homeroom teacher
    const rombelOpt = ROMBEL_OPTIONS.find((r) => r.code === rombelCode);
    const cls = classes.find((c) => c.className === rombelOpt?.full || c.className?.includes(rombelCode));
    if (cls && cls.homeroomTeacherName) {
      return {
        name: cls.homeroomTeacherName,
        nip: DEFAULT_HOMEROOM_TEACHERS[rombelCode]?.nip || '-',
      };
    }
    return DEFAULT_HOMEROOM_TEACHERS[rombelCode] || { name: 'Guru Pengampu / Wali Kelas', nip: '-' };
  };

  const getPredikat = (score: number) => {
    if (score >= 90) return { predikat: 'A', label: 'Sangat Baik', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 80) return { predikat: 'B', label: 'Baik', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (score >= kkm) return { predikat: 'C', label: 'Cukup', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { predikat: 'D', label: 'Perlu Bimbingan', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  // Group count of results by rombel
  const countByRombel = useMemo(() => {
    const counts: Record<string, number> = { ALL: results.length };
    ROMBEL_OPTIONS.forEach((opt) => {
      if (opt.code !== 'ALL') {
        counts[opt.code] = results.filter((r) => getRombelCode(r) === opt.code).length;
      }
    });
    return counts;
  }, [results]);

  // Extract distinct exam subjects from results
  const distinctExamNames = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.examName) set.add(r.examName);
    });
    return Array.from(set);
  }, [results]);

  // Filtered Results
  const filtered = useMemo(() => {
    return results.filter((r) => {
      // Filter Rombel
      if (selectedRombel !== 'ALL') {
        const code = getRombelCode(r);
        if (code !== selectedRombel) return false;
      }

      // Filter Subject / Exam Name
      if (selectedSubject !== 'ALL' && r.examName !== selectedSubject) {
        return false;
      }

      // Filter Status Ketuntasan
      const isTuntas = (r.finalScore || 0) >= kkm;
      if (selectedStatus === 'TUNTAS' && !isTuntas) return false;
      if (selectedStatus === 'REMEDIAL' && isTuntas) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = r.studentName?.toLowerCase().includes(q);
        const nisMatch = r.studentNis?.toLowerCase().includes(q);
        const examMatch = r.examName?.toLowerCase().includes(q);
        const classMatch = r.className?.toLowerCase().includes(q);
        if (!nameMatch && !nisMatch && !examMatch && !classMatch) return false;
      }

      return true;
    });
  }, [results, selectedRombel, selectedSubject, selectedStatus, searchQuery, kkm]);

  // Summary statistics for the filtered selection
  const stats = useMemo(() => {
    const total = filtered.length;
    if (total === 0) {
      return { total: 0, average: 0, max: 0, min: 0, tuntasCount: 0, remedialCount: 0, tuntasPercent: 0 };
    }
    const scores = filtered.map((r) => r.finalScore || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / total) * 10) / 10;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const tuntasCount = filtered.filter((r) => (r.finalScore || 0) >= kkm).length;
    const remedialCount = total - tuntasCount;
    const tuntasPercent = Math.round((tuntasCount / total) * 100);

    return { total, average, max, min, tuntasCount, remedialCount, tuntasPercent };
  }, [filtered, kkm]);

  // Delete Result Handler
  const handleDeleteResult = async (resultId: string, studentName: string) => {
    if (!window.confirm(`Yakin ingin menghapus rekaman nilai untuk siswa "${studentName}"? Siswa dapat melakukan ujian ulang.`)) {
      return;
    }
    try {
      await api.results.delete(resultId);
      setResults((prev) => prev.filter((r) => r.resultId !== resultId));
      showToast(`Nilai siswa ${studentName} berhasil dihapus.`);
    } catch (err: any) {
      alert('Gagal menghapus nilai: ' + (err?.message || 'Kesalahan server'));
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = (format: 'xlsx' | 'xml' = 'xlsx') => {
    if (filtered.length === 0) {
      alert('Tidak ada data nilai yang sesuai dengan filter untuk diunduh.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const activeRombelName = selectedRombel === 'ALL' ? 'Semua Rombel (1A - 6B)' : getRombelFullName(selectedRombel);
    const homeroom = selectedRombel === 'ALL' ? null : getHomeroomTeacherInfo(selectedRombel);

    // Build data matrix
    const rows: any[][] = [
      ['YAYASAN PENDIDIKAN KATOLIK LEO DEHON'],
      ['SD XAVERIUS A1 AMBON - TERAKREDITASI "A"'],
      ['DAFTAR NILAI DAN REKAPITULASI HASIL ASESMEN SUMATIF (CBT)'],
      [],
      ['Rombel / Kelas', activeRombelName, '', 'Tahun Pelajaran', schoolSettings?.academicYear || '2024/2025'],
      ['Mata Pelajaran / Paket', selectedSubject === 'ALL' ? 'Semua Mata Pelajaran' : selectedSubject, '', 'Semester', schoolSettings?.semester || 'Genap'],
      ['Kriteria Ketuntasan (KKM)', `${kkm} (Skala 100)`, '', 'Tanggal Ekspor', todayStr],
      ['Wali Kelas', homeroom ? homeroom.name : 'Seluruh Dewan Guru Kelas', '', 'Kepala Sekolah', schoolSettings?.headmasterName || 'Dra. Maria Regina, S.Pd.'],
      [],
      [
        'NO',
        'NIS / NISN',
        'NAMA SISWA',
        'ROMBEL / KELAS',
        'MATA PELAJARAN / PAKET UJIAN',
        'BENAR',
        'SALAH',
        'NILAI AKHIR',
        'PREDIKAT',
        'STATUS KETUNTASAN',
        'WAKTU PENILAIAN',
      ],
    ];

    // Data rows
    filtered.forEach((r, idx) => {
      const pred = getPredikat(r.finalScore || 0);
      const isTuntas = (r.finalScore || 0) >= kkm;
      const rombelLabel = getRombelFullName(getRombelCode(r));
      const gradedDate = r.gradedAt
        ? new Date(r.gradedAt).toLocaleDateString('id-ID') + ' ' + new Date(r.gradedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

      rows.push([
        idx + 1,
        r.studentNis || '-',
        r.studentName || '-',
        rombelLabel,
        r.examName || '-',
        r.correctAnswersCount || 0,
        r.wrongAnswersCount || 0,
        r.finalScore || 0,
        `${pred.predikat} (${pred.label})`,
        isTuntas ? 'TUNTAS' : 'REMEDIAL',
        gradedDate,
      ]);
    });

    // Summary Rows
    rows.push([]);
    rows.push(['', '', '', '', 'ANALISIS REKAPITULASI HASIL BELAJAR KELAS']);
    rows.push(['', '', '', '', 'Jumlah Peserta Ujian', stats.total, 'Siswa']);
    rows.push(['', '', '', '', 'Rata-Rata Nilai Rombel', stats.average, '/ 100']);
    rows.push(['', '', '', '', 'Nilai Tertinggi (Maksimum)', stats.max, '/ 100']);
    rows.push(['', '', '', '', 'Nilai Terendah (Minimum)', stats.min, '/ 100']);
    rows.push(['', '', '', '', 'Jumlah Siswa Tuntas (>= KKM)', stats.tuntasCount, `Siswa (${stats.tuntasPercent}%)`]);
    rows.push(['', '', '', '', 'Jumlah Siswa Remedial (< KKM)', stats.remedialCount, `Siswa (${100 - stats.tuntasPercent}%)`]);
    rows.push([]);
    rows.push([]);

    // Signatures
    rows.push([
      '',
      '',
      'Mengetahui,',
      '',
      '',
      '',
      '',
      `Ambon, ${todayStr}`,
      '',
      '',
    ]);
    rows.push([
      '',
      '',
      'Kepala SD Xaverius A1 Ambon',
      '',
      '',
      '',
      '',
      'Guru Kelas / Guru Mata Pelajaran',
      '',
      '',
    ]);
    rows.push([]);
    rows.push([]);
    rows.push([]);
    rows.push([
      '',
      '',
      schoolSettings?.headmasterName || 'Dra. Maria Regina, S.Pd.',
      '',
      '',
      '',
      '',
      homeroom ? homeroom.name : 'Guru Pengampu Mata Pelajaran',
      '',
      '',
    ]);
    rows.push([
      '',
      '',
      `NIP. ${schoolSettings?.headmasterNip || '197003151995122001'}`,
      '',
      '',
      '',
      '',
      `NIP. ${homeroom ? homeroom.nip : '-'}`,
      '',
      '',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set Column Widths
    ws['!cols'] = [
      { wch: 6 },  // NO
      { wch: 16 }, // NIS
      { wch: 34 }, // NAMA
      { wch: 15 }, // ROMBEL
      { wch: 38 }, // MAPEL
      { wch: 10 }, // BENAR
      { wch: 10 }, // SALAH
      { wch: 14 }, // NILAI
      { wch: 22 }, // PREDIKAT
      { wch: 20 }, // STATUS
      { wch: 22 }, // WAKTU
    ];

    const sheetName = selectedRombel === 'ALL' ? 'Rekap_Semua_Rombel' : `Nilai_${selectedRombel}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const safeRombel = selectedRombel === 'ALL' ? 'Semua_Rombel' : selectedRombel;
    const dateStamp = new Date().toISOString().split('T')[0];

    if (format === 'xml') {
      const xmlContent = XLSX.write(wb, { bookType: 'xlml', type: 'string' });
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Daftar_Nilai_CBT_${safeRombel}_${dateStamp}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`File Excel (.XML) Daftar Nilai Rombel ${safeRombel} berhasil diunduh.`);
    } else {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Daftar_Nilai_CBT_${safeRombel}_${dateStamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`File Excel (.XLSX) Daftar Nilai Rombel ${safeRombel} berhasil diunduh.`);
    }
  };

  const activeRombelName = selectedRombel === 'ALL' ? 'Semua Rombel (1A - 6B)' : getRombelFullName(selectedRombel);
  const activeHomeroom = selectedRombel === 'ALL' ? null : getHomeroomTeacherInfo(selectedRombel);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#071D49] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D4AF37]/50 flex items-center gap-3 animate-bounce">
          <CheckCheck className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-xl font-black text-[#071D49] tracking-tight">
              Daftar Nilai & Hasil Ujian Siswa Per Rombel
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi perolehan nilai murid SD Xaverius A1 Ambon per rombel (1A - 6B) untuk diserahkan kepada guru kelas & guru mata pelajaran.
          </p>
        </div>

        {/* Action Buttons: Unduh Excel & Cetak Dokumen Resmi */}
        {user?.role !== 'siswa' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* KKM Setting Badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">KKM:</span>
              <select
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-black text-[#071D49] text-xs focus:ring-1 focus:ring-[#071D49]"
                title="Pilih KKM Ketuntasan Minimal"
              >
                <option value={70}>70</option>
                <option value={75}>75</option>
                <option value={80}>80</option>
              </select>
            </div>

            {/* Unduh Excel (.XLSX) */}
            <button
              onClick={() => handleExportExcel('xlsx')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              title="Unduh format Microsoft Excel Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            {/* Unduh Format XML */}
            <button
              onClick={() => handleExportExcel('xml')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              title="Unduh format Excel Spreadsheet XML (.xml)"
            >
              <FileCode2 className="w-4 h-4 text-teal-200" />
              <span>Unduh XML (.xml)</span>
            </button>

            {/* Cetak / Lembar Berita Acara PDF */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#071D49] hover:bg-[#0c2b66] text-white rounded-xl text-xs font-bold transition shadow-sm border border-[#D4AF37]/40 active:scale-95"
              title="Tampilkan Lembar Ledger Resmi untuk dicetak / disimpan PDF dan diserahkan ke Guru"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Cetak / Ledger Resmi (PDF)</span>
            </button>
          </div>
        )}
      </div>

      {/* Rombel Selection Bar (12 Rombel: 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Pilih Rombel / Kelas (12 Rombel SD Xaverius A1 Ambon):
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Terpilih: <strong className="text-[#071D49]">{activeRombelName}</strong>
          </span>
        </div>

        {/* 12 Rombel Buttons Grid / Flow */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {ROMBEL_OPTIONS.map((opt) => {
            const isSelected = selectedRombel === opt.code;
            const count = countByRombel[opt.code] || 0;
            return (
              <button
                key={opt.code}
                onClick={() => setSelectedRombel(opt.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#071D49] text-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30 scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#071D49]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Statistic Cards for Selected Rombel */}
      {user?.role !== 'siswa' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Peserta & Rombel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Peserta Dinilai</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071D49]">{stats.total}</span>
              <span className="text-xs text-slate-500 font-semibold">Siswa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {activeRombelName}
            </p>
          </div>

          {/* Card 2: Rata-Rata Nilai */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rata-Rata Kelas</span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071D49]">{stats.average}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className="text-[11px] mt-1 font-semibold flex items-center gap-1">
              {stats.average >= kkm ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Di Atas KKM ({kkm})
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Di Bawah KKM ({kkm})
                </span>
              )}
            </p>
          </div>

          {/* Card 3: Tertinggi & Terendah */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rentang Nilai</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Maksimum</p>
                <p className="text-xl font-black text-emerald-600">{stats.max}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Minimum</p>
                <p className="text-xl font-black text-rose-600">{stats.min}</p>
              </div>
            </div>
          </div>

          {/* Card 4: Ketuntasan Belajar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ketuntasan (KKM {kkm})</span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{stats.tuntasPercent}%</span>
              <span className="text-xs text-slate-500 font-semibold">Tuntas</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
              <div
                style={{ width: `${stats.tuntasPercent}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all"
              />
              <div
                style={{ width: `${100 - stats.tuntasPercent}%` }}
                className="bg-rose-400 h-full transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
              <span>{stats.tuntasCount} Tuntas</span>
              <span>{stats.remedialCount} Remedial</span>
            </p>
          </div>
        </div>
      )}

      {/* Homeroom Teacher Banner for Selected Rombel */}
      {selectedRombel !== 'ALL' && activeHomeroom && (
        <div className="bg-gradient-to-r from-[#071D49] to-[#0D3882] text-white p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                Data Penyerahan Ledger Nilai - {activeRombelName}
              </p>
              <h3 className="text-sm font-bold text-white">
                Wali Kelas / Guru Kelas: <span className="text-[#D4AF37]">{activeHomeroom.name}</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                NIP. {activeHomeroom.nip} | SD Xaverius A1 Ambon
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#bfa032] text-[#071D49] rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar Penyerahan</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Table Control */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama murid atau NISN..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#071D49]"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Mapel */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#071D49] font-medium text-slate-700"
            >
              <option value="ALL">Semua Mata Pelajaran / Paket</option>
              {distinctExamNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {/* Filter Status Ketuntasan */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#071D49] font-medium text-slate-700"
            >
              <option value="ALL">Semua Status Ketuntasan</option>
              <option value="TUNTAS">Hanya Tuntas (≥ {kkm})</option>
              <option value="REMEDIAL">Hanya Remedial (&lt; {kkm})</option>
            </select>

            {/* Reset Button */}
            {(selectedRombel !== 'ALL' || selectedSubject !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedRombel('ALL');
                  setSelectedSubject('ALL');
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                Reset Filter
              </button>
            )}

            <button
              onClick={loadData}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              title="Perbarui Data Nilai"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa / NISN</th>
                <th className="py-3.5 px-4 text-center">Rombel</th>
                <th className="py-3.5 px-4">Mata Pelajaran / Paket Ujian</th>
                <th className="py-3.5 px-4 text-center">Jawaban (B/S)</th>
                <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                <th className="py-3.5 px-4 text-center">Predikat</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Waktu Penilaian</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="font-bold">Memuat data rekapitulasi nilai per rombel...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">Tidak ada data nilai yang sesuai kriteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Silakan pilih rombel lain atau lakukan reset pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((res, index) => {
                  const score = res.finalScore || 0;
                  const isTuntas = score >= kkm;
                  const pred = getPredikat(score);
                  const rombelCode = getRombelCode(res);
                  const rombelName = getRombelFullName(rombelCode);

                  return (
                    <tr key={res.resultId} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#071D49]">{res.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">NIS: {res.studentNis || '-'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-black bg-[#071D49]/10 text-[#071D49] border border-[#071D49]/20 font-mono">
                          {rombelName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {res.examName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-emerald-600 font-black">{res.correctAnswersCount || 0}</span>
                        <span className="text-slate-400 font-mono mx-1">/</span>
                        <span className="text-rose-500 font-bold">{res.wrongAnswersCount || 0}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${
                            isTuntas
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${pred.color}`}>
                          {pred.predikat} ({pred.label})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                            isTuntas
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isTuntas ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> TUNTAS
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> REMEDIAL
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px] text-slate-400 font-mono">
                        {res.gradedAt ? new Date(res.gradedAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setActiveDetailResult(res);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#071D49] hover:bg-slate-100 rounded-lg transition"
                            title="Lihat Lembar Nilai Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteResult(res.resultId, res.studentName || '')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Nilai (Untuk Ujian Ulang)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL CETAK / LEMBAR BERITA ACARA & LEDGER NILAI RESMI        */}
      {/* ============================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Dokumen Lembar Nilai Resmi</h3>
                  <p className="text-[11px] text-slate-300">Siap dicetak atau disimpan sebagai PDF untuk Guru Kelas / Mapel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#bfa032] text-[#071D49] rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang (Print / PDF)
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet (A4 Styled White Document) */}
            <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 font-sans print-area" id="print-document">
              {/* Kop Surat Yayasan & Sekolah */}
              <div className="border-b-4 border-double border-[#071D49] pb-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#071D49] text-[#D4AF37] font-black text-xl shadow-sm">
                    XA
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                      Yayasan Pendidikan Katolik Leo Dehon
                    </h4>
                    <h2 className="text-xl font-black text-[#071D49] tracking-tight">
                      SD XAVERIUS A1 AMBON
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-600">
                      TERAKREDITASI &quot;A&quot; | NSS: 102216001001 | NPSN: 60102030
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Jl. Pattimura No. 1, Kel. Uritetu, Kec. Sirimau, Kota Ambon, Maluku 97124
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center mb-6">
                <h3 className="text-base font-black uppercase tracking-wide text-slate-900 underline underline-offset-4">
                  Daftar Nilai Dan Rekapitulasi Hasil Asesmen Siswa (CBT)
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  Tahun Pelajaran {schoolSettings?.academicYear || '2024/2025'} - Semester {schoolSettings?.semester || 'Genap'}
                </p>
              </div>

              {/* Document Identity Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">Rombel / Kelas:</span>
                    <strong className="text-[#071D49]">{activeRombelName}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">Mata Pelajaran:</span>
                    <strong>{selectedSubject === 'ALL' ? 'Semua Mata Pelajaran / Paket' : selectedSubject}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">KKM Ketuntasan:</span>
                    <strong className="text-emerald-700">{kkm} (Skala 100)</strong>
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">Wali / Guru Kelas:</span>
                    <strong>{activeHomeroom ? activeHomeroom.name : 'Seluruh Dewan Guru'}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">Kepala Sekolah:</span>
                    <strong>{schoolSettings?.headmasterName || 'Dra. Maria Regina, S.Pd.'}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500 w-36 inline-block">Tanggal Penyerahan:</span>
                    <strong>
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Table in Print */}
              <div className="mb-6">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-10">No</th>
                      <th className="py-2 px-3 border-r border-slate-300 w-28">NIS / NISN</th>
                      <th className="py-2 px-3 border-r border-slate-300">Nama Siswa</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-20">Rombel</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-16">Benar</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-16">Salah</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-20">Nilai Akhir</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-24">Predikat</th>
                      <th className="py-2 px-3 text-center w-28">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((r, i) => {
                      const score = r.finalScore || 0;
                      const isTuntas = score >= kkm;
                      const pred = getPredikat(score);
                      return (
                        <tr key={r.resultId}>
                          <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">{i + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-300 font-mono">{r.studentNis || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-300 font-bold">{r.studentName}</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center">{getRombelFullName(getRombelCode(r))}</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center">{r.correctAnswersCount || 0}</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center">{r.wrongAnswersCount || 0}</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center font-black">{score}</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center">{pred.predikat}</td>
                          <td className="py-2 px-3 text-center font-bold">
                            <span className={isTuntas ? 'text-emerald-700' : 'text-rose-700'}>
                              {isTuntas ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Statistical Summary Box */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-xs mb-8">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Rekapitulasi Ketuntasan Belajar Siswa:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-500">Jumlah Peserta:</span>
                    <strong className="block text-sm text-slate-800">{stats.total} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Rata-Rata Kelas:</span>
                    <strong className="block text-sm text-[#071D49]">{stats.average} / 100</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Nilai Tertinggi / Terendah:</span>
                    <strong className="block text-sm text-slate-800">{stats.max} / {stats.min}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Ketuntasan Klasikal:</span>
                    <strong className="block text-sm text-emerald-700">
                      {stats.tuntasCount} Tuntas ({stats.tuntasPercent}%)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-xs pt-4">
                <div className="text-center">
                  <p className="font-semibold text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-800 mt-1">Kepala SD Xaverius A1 Ambon</p>
                  <div className="h-20" />
                  <p className="font-black text-slate-900 underline">
                    {schoolSettings?.headmasterName || 'Dra. Maria Regina, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NIP. {schoolSettings?.headmasterNip || '197003151995122001'}
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-semibold text-slate-600">
                    Ambon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-bold text-slate-800 mt-1">Guru Kelas / Guru Mata Pelajaran</p>
                  <div className="h-20" />
                  <p className="font-black text-slate-900 underline">
                    {activeHomeroom ? activeHomeroom.name : 'Guru Pengampu Mata Pelajaran'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NIP. {activeHomeroom ? activeHomeroom.nip : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DETAIL LEMBAR NILAI PERORANGAN SISWA                     */}
      {/* ============================================================== */}
      {isDetailModalOpen && activeDetailResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Transkrip Nilai Siswa (CBT)</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Perolehan Nilai Akhir</p>
                <h2 className="text-4xl font-black text-[#071D49] mt-1">
                  {activeDetailResult.finalScore || 0}
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">Skala Penilaian: 0 - 100</p>
                <div className="mt-3 inline-block">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      (activeDetailResult.finalScore || 0) >= kkm
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {(activeDetailResult.finalScore || 0) >= kkm ? 'TUNTAS (LULUS KKM)' : 'REMEDIAL (BELUM TUNTAS)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Nama Siswa:</span>
                  <strong className="text-slate-900">{activeDetailResult.studentName}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Nomor Induk Siswa (NIS):</span>
                  <strong className="text-slate-900 font-mono">{activeDetailResult.studentNis || '-'}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Rombel / Kelas:</span>
                  <strong className="text-slate-900">{getRombelFullName(getRombelCode(activeDetailResult))}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Paket Ujian:</span>
                  <strong className="text-slate-900">{activeDetailResult.examName}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Jawaban Benar:</span>
                  <strong className="text-emerald-600">{activeDetailResult.correctAnswersCount || 0} Butir Soal</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Jawaban Salah:</span>
                  <strong className="text-rose-600">{activeDetailResult.wrongAnswersCount || 0} Butir Soal</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Waktu Penilaian:</span>
                  <strong className="text-slate-700">
                    {activeDetailResult.gradedAt ? new Date(activeDetailResult.gradedAt).toLocaleString('id-ID') : '-'}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
