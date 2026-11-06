/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ExamSession, ExamLog, Exam, ProctorAssignment, SchoolClass } from '../types';
import {
  Eye,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  X,
  Sparkles,
  Users,
  Check,
  AlertCircle,
  Building,
  Phone,
  FileText,
} from 'lucide-react';

interface ParsedAssignmentRow {
  roomName: string;
  proctorName: string;
  nipOrCode: string;
  contactNumber: string;
  examName: string;
  targetClasses: string;
  sessionTime: string;
  status: 'assigned' | 'present' | 'completed';
  isValid: boolean;
  notes?: string;
}

export const ProctorView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'live' | 'assignments'>('live');

  // Live monitoring state
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [logs, setLogs] = useState<ExamLog[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Proctor assignments state
  const [assignments, setAssignments] = useState<ProctorAssignment[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState<string>('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProctorAssignment | null>(null);

  // Form state for single assignment
  const [formRoom, setFormRoom] = useState('Ruang 01');
  const [formProctorName, setFormProctorName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formExamName, setFormExamName] = useState('');
  const [formClasses, setFormClasses] = useState('6A, 6B');
  const [formTime, setFormTime] = useState('08:00 - 10:00 WIT');
  const [formStatus, setFormStatus] = useState<'assigned' | 'present' | 'completed'>('assigned');

  // Bulk import state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedAssignmentRow[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProctorData = async () => {
    try {
      const [proctorRes, examRes, assignRes, masterRes] = await Promise.all([
        api.proctor.getSessions(selectedExamId || undefined),
        api.exams.getAll(),
        api.proctor.getAssignments().catch(() => ({ success: true, assignments: [] })),
        api.master.getAll().catch(() => ({ classes: [] })),
      ]);
      setSessions(proctorRes.sessions || []);
      setLogs(proctorRes.logs || []);
      setExams(examRes.exams || []);
      setAssignments(assignRes.assignments || []);
      setClasses((masterRes as any)?.classes || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to load proctoring data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProctorData();
    // Auto polling for live proctoring monitoring every 5 seconds
    const interval = setInterval(loadProctorData, 5000);
    return () => clearInterval(interval);
  }, [selectedExamId]);

  const handleUnlock = async (sessionId: string) => {
    try {
      await api.proctor.unlockSession(sessionId);
      loadProctorData();
    } catch (e: any) {
      alert(e.message || 'Gagal membuka kunci sesi.');
    }
  };

  // ==========================================
  // TEMPLATE EXCEL PENUGASAN PENGAWAS (.xlsx)
  // ==========================================
  const handleDownloadTemplate = () => {
    const headers = [
      'Nama Ruang Ujian',
      'Nama Pengawas',
      'NIP / Kode Pengawas',
      'No. HP / Kontak',
      'Paket Ujian Target',
      'Rombel Kelas Diampu',
      'Waktu Pelaksanaan',
      'Status (assigned/present/completed)',
    ];

    const sampleRows = [
      ['Ruang 01 (Lantai 1)', 'Dra. Maria Rumlus', '197505122000032001', '081234567890', 'Asesmen Sumatif IPAS', '6A, 6B', '08:00 - 10:00 WIT', 'assigned'],
      ['Ruang 02 (Lantai 1)', 'Yohanes Tanate, S.Pd.', '198207152008011004', '081398765432', 'Penilaian Akhir Semester Matematika', '5A, 5B', '08:00 - 09:30 WIT', 'assigned'],
      ['Ruang 03 (Lantai 2)', 'Kristina Lerebulan, S.Pd.', '198904222014022002', '082155443322', 'Asesmen Sumatif Bahasa Indonesia', '4A, 4B', '08:00 - 09:30 WIT', 'assigned'],
      ['Ruang 04 (Lantai 2)', 'Petrus Rahayaan, S.Pd.', '199102182017011005', '085211223344', 'Penilaian Tengah Semester IPAS', '3A, 3B', '08:00 - 09:15 WIT', 'assigned'],
      ['Ruang 05 (Lantai 3)', 'Theresia Matly, S.Pd.', '198611092011012003', '081288776655', 'Penilaian Harian Matematika', '2A, 2B', '08:00 - 09:00 WIT', 'assigned'],
      ['Ruang 06 (Lantai 3)', 'Agustinus Renyaan, S.Ag.', '198403252009021003', '082233445566', 'Penilaian Tematik Agama Katolik', '1A, 1B', '08:00 - 09:00 WIT', 'assigned'],
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Penugasan_Pengawas
    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 24 }, // Nama Ruang
      { wch: 30 }, // Nama Pengawas
      { wch: 24 }, // NIP
      { wch: 18 }, // No HP
      { wch: 38 }, // Paket Ujian
      { wch: 22 }, // Rombel Kelas
      { wch: 22 }, // Waktu
      { wch: 18 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Penugasan_Pengawas');

    // Sheet 2: Petunjuk & Referensi (12 Rombel Lengkap)
    const petunjukData = [
      ['PANDUAN PENGISIAN TEMPLATE PENUGASAN PENGAWAS RUANG UJIAN - SD XAVERIUS A1 AMBON'],
      ['TAHUN AJARAN 2024/2025 • 12 ROMBEL LENGKAP (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B)'],
      [''],
      ['No', 'Nama Kolom', 'Ketentuan Pengisian', 'Contoh'],
      ['1', 'Nama Ruang Ujian', 'Isi nomor ruang, lantai, atau nama lab.', 'Ruang 01 (Lantai 1)'],
      ['2', 'Nama Pengawas', 'Nama lengkap pengawas beserta gelar.', 'Dra. Maria Rumlus'],
      ['3', 'NIP / Kode Pengawas', 'Nomor Induk Pegawai atau kode pengawas.', '197505122000032001'],
      ['4', 'No. HP / Kontak', 'Nomor telepon/WhatsApp aktif pengawas.', '081234567890'],
      ['5', 'Paket Ujian Target', 'Nama mata pelajaran atau nama paket ujian.', 'Asesmen Sumatif IPAS'],
      ['6', 'Rombel Kelas Diampu', 'Pilih dari 12 rombel (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B).', '6A, 6B'],
      ['7', 'Waktu Pelaksanaan', 'Rentang jam pengawasan ujian.', '08:00 - 10:00 WIT'],
      ['8', 'Status', 'Isi "assigned" (ditugaskan), "present" (hadir), atau "completed" (selesai).', 'assigned'],
      [''],
      ['DAFTAR 12 ROMBEL KELAS TERSEDIA:'],
      ['1A (Kelas 1 Rombel A)', '1B (Kelas 1 Rombel B)'],
      ['2A (Kelas 2 Rombel A)', '2B (Kelas 2 Rombel B)'],
      ['3A (Kelas 3 Rombel A)', '3B (Kelas 3 Rombel B)'],
      ['4A (Kelas 4 Rombel A)', '4B (Kelas 4 Rombel B)'],
      ['5A (Kelas 5 Rombel A)', '5B (Kelas 5 Rombel B)'],
      ['6A (Kelas 6 Rombel A)', '6B (Kelas 6 Rombel B)'],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 40 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Penugasan_Pengawas_SD_Xaverius_A1_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // BULK UPLOAD EXCEL HANDLER
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          alert('File Excel kosong atau tidak memiliki baris data.');
          return;
        }

        // Find header row
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawJson.length, 5); i++) {
          const rowStr = (rawJson[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('ruang') || rowStr.includes('pengawas') || rowStr.includes('nip')) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = rawJson.slice(headerRowIndex + 1);
        const parsed: ParsedAssignmentRow[] = dataRows
          .filter((r) => r && r.length > 0 && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ''))
          .map((r) => {
            const roomName = String(r[0] || '').trim();
            const proctorName = String(r[1] || '').trim();
            const nipOrCode = String(r[2] || '').trim();
            const contactNumber = String(r[3] || '').trim();
            const examName = String(r[4] || '').trim();
            const targetClasses = String(r[5] || '').trim();
            const sessionTime = String(r[6] || '').trim() || '08:00 - 10:00 WIT';
            const rawStatus = String(r[7] || '').trim().toLowerCase();
            const status: 'assigned' | 'present' | 'completed' =
              rawStatus === 'present' ? 'present' : rawStatus === 'completed' ? 'completed' : 'assigned';

            const isValid = roomName.length > 0 && proctorName.length > 0;
            return {
              roomName: roomName || 'Ruang Ujian',
              proctorName,
              nipOrCode,
              contactNumber,
              examName: examName || 'Ujian Sekolah CBT',
              targetClasses: targetClasses || 'Semua Rombel',
              sessionTime,
              status,
              isValid,
              notes: !isValid ? 'Nama Ruang dan Nama Pengawas wajib diisi' : undefined,
            };
          });

        setParsedRows(parsed);
        setIsBulkModalOpen(true);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + (err.message || 'Format tidak didukung'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada baris data penugasan pengawas yang valid untuk diimpor.');
      return;
    }

    setBulkImporting(true);
    try {
      const payload = validRows.map((r) => ({
        roomName: r.roomName,
        proctorName: r.proctorName,
        nipOrCode: r.nipOrCode,
        contactNumber: r.contactNumber,
        examName: r.examName,
        targetClasses: r.targetClasses,
        sessionTime: r.sessionTime,
        status: r.status,
      }));

      const res = await api.proctor.bulkImportAssignments(payload);
      alert(`Berhasil mengimpor ${res.importedCount || payload.length} penugasan pengawas ruang!`);
      setIsBulkModalOpen(false);
      setParsedRows([]);
      setBulkFile(null);
      loadProctorData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan data penugasan pengawas.');
    } finally {
      setBulkImporting(false);
    }
  };

  // ==========================================
  // SINGLE ASSIGNMENT SAVE
  // ==========================================
  const handleSaveSingleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoom.trim() || !formProctorName.trim()) {
      alert('Nama Ruang dan Nama Pengawas wajib diisi.');
      return;
    }

    try {
      await api.proctor.saveAssignment({
        assignmentId: editingAssignment?.assignmentId || editingAssignment?.id,
        id: editingAssignment?.assignmentId || editingAssignment?.id,
        roomName: formRoom,
        proctorName: formProctorName,
        nipOrCode: formNip,
        contactNumber: formPhone,
        examName: formExamName || 'Asesmen CBT Sekolah',
        targetClasses: formClasses,
        sessionTime: formTime,
        status: formStatus,
      });

      setIsAssignModalOpen(false);
      setEditingAssignment(null);
      loadProctorData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan penugasan pengawas.');
    }
  };

  const handleDeleteAssignment = async (id: string, name: string) => {
    if (!window.confirm(`Hapus penugasan untuk ${name}?`)) return;
    try {
      await api.proctor.deleteAssignment(id);
      loadProctorData();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus penugasan.');
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = assignmentSearch.toLowerCase();
    return (
      a.proctorName.toLowerCase().includes(q) ||
      a.roomName.toLowerCase().includes(q) ||
      (a.targetClasses && a.targetClasses.toLowerCase().includes(q)) ||
      (a.examName && a.examName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#D4AF37]" /> Manajemen & Pengawasan Ujian (Proctor Hub)
            </h2>
            <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-emerald-500" title="Monitoring Real-Time Aktif" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SD XAVERIUS A1 AMBON • Pemantauan live aktivitas peserta, deteksi kecurangan, dan distribusi penugasan pengawas ruang 12 Rombel (1A - 6B).
          </p>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-white text-[#071D49] shadow-xs'
                  : 'text-slate-600 hover:text-[#071D49]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Pemantauan Live</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'assignments'
                  ? 'bg-white text-[#071D49] shadow-xs'
                  : 'text-slate-600 hover:text-[#071D49]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Penugasan Pengawas Ruang</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-black">
                {assignments.length}
              </span>
            </button>
          </div>

          {activeTab === 'live' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-[#071D49]"
              >
                <option value="">Semua Paket Ujian Aktif</option>
                {exams.map((ex) => (
                  <option key={ex.examId} value={ex.examId}>
                    {ex.examName} ({ex.token})
                  </option>
                ))}
              </select>

              <button
                onClick={loadProctorData}
                className="p-2 text-slate-600 hover:text-[#071D49] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Refresh Live Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-emerald-300 shadow-2xs cursor-pointer"
                title="Unduh template Excel resmi (.xlsx) untuk diisi manual"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Unduh Template (.xlsx)</span>
              </button>

              <label className="px-3 py-1.5 bg-[#5BA5D5] hover:bg-[#4A94C4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Unggah & Impor (.xlsx)</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .xml, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  setEditingAssignment(null);
                  setFormRoom('Ruang 01 (Lantai 1)');
                  setFormProctorName('');
                  setFormNip('');
                  setFormPhone('');
                  setFormExamName(exams[0]?.examName || 'Asesmen CBT Sekolah');
                  setFormClasses('6A, 6B');
                  setFormTime('08:00 - 10:00 WIT');
                  setFormStatus('assigned');
                  setIsAssignModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Tugas Satuan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PEMANTAUAN LANGSUNG (LIVE MONITORING)             */}
      {/* ======================================================== */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Peserta Sesi</p>
              <p className="text-2xl font-black text-[#071D49] mt-1">{sessions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Sedang Mengerjakan</p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {sessions.filter((s) => s.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Selesai Submit</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {sessions.filter((s) => s.status === 'submitted').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Indikasi Pelanggaran</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {sessions.reduce((acc, s) => acc + (s.violationCount || 0), 0)}
              </p>
            </div>
          </div>

          {/* Sessions Table and Live Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Participants Table (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" /> Status Peserta Ujian
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Pembaruan: {lastRefreshed}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Nama Peserta / NIS</th>
                      <th className="py-3 px-4">Paket Ujian</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Pelanggaran</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Belum ada sesi ujian peserta aktif saat ini.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((ses) => (
                        <tr key={ses.sessionId} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#071D49]">{ses.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">NIS: {ses.studentNis}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[140px] truncate">{ses.examName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ses.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ses.status === 'submitted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {ses.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />}
                              {ses.status === 'in_progress' ? 'Mengerjakan' : ses.status === 'submitted' ? 'Selesai' : 'Terkunci'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {ses.violationCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[11px]">
                                {ses.violationCount}x
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {ses.status === 'blocked' ? (
                              <button
                                onClick={() => handleUnlock(ses.sessionId)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                Buka Kunci
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(ses.lastActiveAt).toLocaleTimeString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Proctor Activity Stream (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Log Aktivitas Layar & Integritas
              </h3>

              <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Tidak ada catatan pelanggaran.</p>
                ) : (
                  logs.slice(0, 20).map((l) => (
                    <div key={l.logId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#071D49]">{l.studentName}</span>
                        <span className="text-slate-400 font-mono">{new Date(l.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{l.eventType === 'tab_switch' ? 'Pindah Tab / Minimize' : l.eventType}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">{l.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DAFTAR & PENUGASAN PENGAWAS RUANG                 */}
      {/* ======================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengawas, ruang, atau rombel..."
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#5BA5D5] bg-slate-50"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{filteredAssignments.length}</strong> dari <strong>{assignments.length}</strong> penugasan pengawas
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ruang Ujian</th>
                    <th className="py-3 px-4">Nama Pengawas</th>
                    <th className="py-3 px-4">Kontak / NIP</th>
                    <th className="py-3 px-4">Paket Ujian & Rombel</th>
                    <th className="py-3 px-4">Waktu Tugas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold">Belum ada data penugasan pengawas ruang.</p>
                        <p className="text-[11px] mt-1 text-slate-400">
                          Gunakan tombol <strong>"Unduh Template (.xlsx)"</strong> lalu <strong>"Unggah & Impor (.xlsx)"</strong> untuk mengisi secara massal.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a, aIdx) => (
                      <tr key={a.assignmentId || a.id || aIdx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-amber-50 text-[#071D49] border border-amber-200 font-bold">
                              <Building className="w-4 h-4 text-[#D4AF37]" />
                            </span>
                            <span className="font-bold text-[#071D49]">{a.roomName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{a.proctorName}</p>
                          {(a.nipOrCode || a.nip) && (
                            <p className="text-[10px] text-slate-400 font-mono">NIP: {a.nipOrCode || a.nip}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {a.contactNumber || a.contact ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Phone className="w-3 h-3 text-slate-400" /> {a.contactNumber || a.contact}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{a.examName}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {(a.targetClasses || '1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B')
                              .split(',')
                              .slice(0, 4)
                              .map((cls: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-200"
                                >
                                  {cls.trim()}
                                </span>
                              ))}
                            {(a.targetClasses || '').split(',').length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{(a.targetClasses || '').split(',').length - 4} rombel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {a.sessionTime || '08:00 - 10:00 WIT'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                a.status === 'present' ? 'bg-emerald-500' : a.status === 'completed' ? 'bg-slate-400' : 'bg-blue-500'
                              }`}
                            />
                            {a.status === 'present' ? 'Hadir di Ruang' : a.status === 'completed' ? 'Selesai' : 'Ditugaskan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAssignment(a.assignmentId || a.id || '', a.proctorName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus penugasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT PENUGASAN SATUAN                    */}
      {/* ======================================================== */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#071D49]/10 rounded-xl">
                  <UserCheck className="w-5 h-5 text-[#071D49]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#071D49]">
                    {editingAssignment ? 'Edit Penugasan Pengawas' : 'Tambah Penugasan Pengawas Ruang'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Distribusikan pengawas ke ruang dan rombel kelas ujian</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleAssignment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nama Ruang Ujian *</label>
                  <input
                    type="text"
                    required
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Contoh: Ruang 01 (Lantai 1)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status Kehadiran</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none"
                  >
                    <option value="assigned">Ditugaskan</option>
                    <option value="present">Hadir di Ruang</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nama Lengkap Pengawas *</label>
                <input
                  type="text"
                  required
                  value={formProctorName}
                  onChange={(e) => setFormProctorName(e.target.value)}
                  placeholder="Contoh: Dra. Maria Rumlus, S.Pd."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">NIP / Kode Pengawas</label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="19820715..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Paket Ujian Yang Diawasi</label>
                <input
                  type="text"
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  placeholder="Contoh: Asesmen Sumatif Akhir Jenjang - IPAS"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Rombel Kelas Diampu (1A - 6B)
                  </label>
                  <input
                    type="text"
                    value={formClasses}
                    onChange={(e) => setFormClasses(e.target.value)}
                    placeholder="Contoh: 6A, 6B"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none font-semibold text-[#071D49]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="08:00 - 10:00 WIT"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#5BA5D5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Simpan Penugasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BULK IMPORT EXCEL PENUGASAN PENGAWAS              */}
      {/* ======================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#071D49] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Impor Penugasan Pengawas Ruang (.xlsx)</h3>
                  <p className="text-[11px] text-slate-300">
                    File: <span className="font-mono text-[#D4AF37]">{bulkFile?.name}</span> • Ditemukan {parsedRows.length} baris data
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setParsedRows([]);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Valid: <strong>{parsedRows.filter((r) => r.isValid).length}</strong> baris siap diimpor.{' '}
                    {parsedRows.some((r) => !r.isValid) && (
                      <span className="text-red-600 font-semibold">
                        ({parsedRows.filter((r) => !r.isValid).length} baris tidak lengkap akan dilewati)
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Ulang Template
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Ruang</th>
                      <th className="py-2.5 px-3">Nama Pengawas</th>
                      <th className="py-2.5 px-3">NIP / Kontak</th>
                      <th className="py-2.5 px-3">Paket Ujian</th>
                      <th className="py-2.5 px-3">Rombel Target</th>
                      <th className="py-2.5 px-3">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Siap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[10px]" title={r.notes}>
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Lewati
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#071D49]">{r.roomName}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{r.proctorName}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                          {r.nipOrCode || r.contactNumber || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[160px] truncate">{r.examName}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                            {r.targetClasses}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{r.sessionTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Format didukung: <strong>.xlsx (Excel biasa), .xls, .xml, .csv</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setParsedRows([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={bulkImporting || parsedRows.filter((r) => r.isValid).length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {bulkImporting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-100" />
                      <span>Impor {parsedRows.filter((r) => r.isValid).length} Penugasan Pengawas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
