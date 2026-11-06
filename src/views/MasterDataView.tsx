/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Student, Teacher, SchoolClass, Subject, SchoolSettings } from '../types';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Settings,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Save,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  Check,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ParsedStudentRow {
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  className: string;
  academicYear: string;
  status: 'active' | 'inactive';
  isValid: boolean;
  notes?: string;
}

interface ParsedTeacherRow {
  nip: string;
  fullName: string;
  email: string;
  subjectNames: string;
  assignedClasses: string;
  status: 'active' | 'inactive';
  isValid: boolean;
  notes?: string;
}

export const MasterDataView: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin']);

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'classes' | 'subjects' | 'settings'>('students');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // Form Modal State (Single Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'teacher' | 'class' | 'subject' | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bulk Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkType, setBulkType] = useState<'student' | 'teacher'>('student');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedStudentRows, setParsedStudentRows] = useState<ParsedStudentRow[]>([]);
  const [parsedTeacherRows, setParsedTeacherRows] = useState<ParsedTeacherRow[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);

  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const teacherFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.master.getAll();
      setStudents(res.students || []);
      setTeachers(res.teachers || []);
      setClasses(res.classes || []);
      setSubjects(res.subjects || []);
      setSchoolSettings(res.schoolSettings || null);
    } catch (e) {
      console.error('Failed to load master data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // TEMPLATES DOWNLOAD (Excel .xlsx)
  // ==========================================
  const handleDownloadStudentTemplate = () => {
    const headers = [
      'NIS (Nomor Induk Siswa)',
      'NISN',
      'Nama Lengkap Siswa',
      'Jenis Kelamin (L/P)',
      'Rombel Kelas (1A - 6B)',
      'Tahun Ajaran',
      'Status (active/inactive)',
    ];

    const sampleRows = [
      ['20240101', '0123456781', 'Gabriel Renyaan', 'L', '1A', '2024/2025', 'active'],
      ['20240102', '0123456782', 'Maria Fransiska Lerebulan', 'P', '1B', '2024/2025', 'active'],
      ['20230201', '0123456783', 'Yoseph Tanate', 'L', '2A', '2024/2025', 'active'],
      ['20230202', '0123456784', 'Theresia Rahayaan', 'P', '2B', '2024/2025', 'active'],
      ['20220301', '0123456785', 'Aloysius Matly', 'L', '3A', '2024/2025', 'active'],
      ['20220302', '0123456786', 'Agatha Rumlus', 'P', '3B', '2024/2025', 'active'],
      ['20210401', '0123456787', 'Ignatius Pattipeilohy', 'L', '4A', '2024/2025', 'active'],
      ['20210402', '0123456788', 'Benedikta Tuhumury', 'P', '4B', '2024/2025', 'active'],
      ['20200501', '0123456789', 'Klemens Soplanit', 'L', '5A', '2024/2025', 'active'],
      ['20200502', '0123456790', 'Katarina Leatemia', 'P', '5B', '2024/2025', 'active'],
      ['20190601', '0123456791', 'Michael Fransisco de Lima', 'L', '6A', '2024/2025', 'active'],
      ['20190602', '0123456792', 'Bernadeth Angela Titarsole', 'P', '6B', '2024/2025', 'active'],
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Master_Data_Siswa
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [
      { wch: 26 }, // NIS
      { wch: 18 }, // NISN
      { wch: 34 }, // Nama
      { wch: 20 }, // JK
      { wch: 24 }, // Rombel Kelas
      { wch: 16 }, // Tahun Ajaran
      { wch: 22 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Data_Siswa');

    // Sheet 2: Petunjuk dan 12 Rombel
    const petunjuk = [
      ['PANDUAN PENGISIAN MASTER DATA SISWA - SD XAVERIUS A1 AMBON'],
      ['TAHUN AJARAN 2024/2025 • 12 ROMBEL KELAS RESMI'],
      [''],
      ['No', 'Kolom', 'Keterangan Pengisian', 'Contoh Nilai'],
      ['1', 'NIS', 'Nomor Induk Siswa lokal sekolah (unik).', '20240101'],
      ['2', 'NISN', 'Nomor Induk Siswa Nasional (10 digit).', '0123456781'],
      ['3', 'Nama Lengkap Siswa', 'Nama siswa sesuai akta lahir/kartu keluarga.', 'Gabriel Renyaan'],
      ['4', 'Jenis Kelamin', 'Ketik L (Laki-laki) atau P (Perempuan).', 'L'],
      ['5', 'Rombel Kelas', 'Wajib salah satu dari 12 rombel (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B).', '6A'],
      ['6', 'Tahun Ajaran', 'Format YYYY/YYYY.', '2024/2025'],
      ['7', 'Status', 'Ketik "active" atau "inactive".', 'active'],
      [''],
      ['DAFTAR 12 ROMBEL TERSEDIA DI SISTEM:'],
      ['1A (Kelas 1 Rombel A)', '1B (Kelas 1 Rombel B)'],
      ['2A (Kelas 2 Rombel A)', '2B (Kelas 2 Rombel B)'],
      ['3A (Kelas 3 Rombel A)', '3B (Kelas 3 Rombel B)'],
      ['4A (Kelas 4 Rombel A)', '4B (Kelas 4 Rombel B)'],
      ['5A (Kelas 5 Rombel A)', '5B (Kelas 5 Rombel B)'],
      ['6A (Kelas 6 Rombel A)', '6B (Kelas 6 Rombel B)'],
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(petunjuk);
    wsRef['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsRef, 'Petunjuk_Dan_12_Rombel');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Data_Siswa_12Rombel_SD_Xaverius_A1_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTeacherTemplate = () => {
    const headers = [
      'NIP / NUPTK',
      'Nama Lengkap Guru (dengan Gelar)',
      'Email Resmi / Sekolah',
      'Mata Pelajaran Diampu',
      'Rombel Kelas Ditugaskan',
      'Status (active/inactive)',
    ];

    const sampleRows = [
      ['197505122000032001', 'Dra. Maria Rumlus', 'maria.rumlus@xaverius-ambon.sch.id', 'IPAS, Tematik', '6A, 6B', 'active'],
      ['198207152008011004', 'Yohanes Tanate, S.Pd.', 'yohanes.tanate@xaverius-ambon.sch.id', 'Matematika', '5A, 5B, 6A', 'active'],
      ['198904222014022002', 'Kristina Lerebulan, S.Pd.', 'kristina.l@xaverius-ambon.sch.id', 'Bahasa Indonesia', '4A, 4B', 'active'],
      ['199102182017011005', 'Petrus Rahayaan, S.Pd.', 'petrus.r@xaverius-ambon.sch.id', 'IPAS, Olahraga', '3A, 3B', 'active'],
      ['198611092011012003', 'Theresia Matly, S.Pd.', 'theresia.m@xaverius-ambon.sch.id', 'Matematika, SBdP', '2A, 2B', 'active'],
      ['198403252009021003', 'Agustinus Renyaan, S.Ag.', 'agustinus.r@xaverius-ambon.sch.id', 'Pendidikan Agama Katolik & Budi Pekerti', '1A, 1B, 2A, 2B', 'active'],
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Master_Data_Guru
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [
      { wch: 24 }, // NIP
      { wch: 35 }, // Nama
      { wch: 35 }, // Email
      { wch: 38 }, // Mapel
      { wch: 25 }, // Rombel
      { wch: 20 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Data_Guru');

    // Sheet 2: Petunjuk
    const petunjuk = [
      ['PANDUAN PENGISIAN MASTER DATA GURU - SD XAVERIUS A1 AMBON'],
      ['TAHUN AJARAN 2024/2025 • 12 ROMBEL KELAS'],
      [''],
      ['No', 'Kolom', 'Keterangan', 'Contoh'],
      ['1', 'NIP / NUPTK', 'Nomor Induk Pegawai atau NUPTK. Kosongkan jika belum ada.', '197505122000032001'],
      ['2', 'Nama Lengkap Guru', 'Nama lengkap beserta gelar akademik.', 'Dra. Maria Rumlus'],
      ['3', 'Email Resmi', 'Alamat email aktif.', 'maria@xaverius-ambon.sch.id'],
      ['4', 'Mata Pelajaran Diampu', 'Nama mapel atau kode mapel.', 'IPAS, Matematika'],
      ['5', 'Rombel Kelas Ditugaskan', 'Pilih dari 12 rombel (1A - 6B).', '6A, 6B'],
      ['6', 'Status', 'active atau inactive.', 'active'],
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(petunjuk);
    wsRef['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsRef, 'Petunjuk_Pengisian');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Data_Guru_SD_Xaverius_A1_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // UPLOAD FILE HANDLERS (Excel .xlsx / .xml / .csv)
  // ==========================================
  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkType('student');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          alert('File kosong atau tidak memiliki baris data.');
          return;
        }

        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawJson.length, 5); i++) {
          const rowStr = (rawJson[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('nis') || rowStr.includes('siswa') || rowStr.includes('nama')) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = rawJson.slice(headerRowIndex + 1);
        const parsed: ParsedStudentRow[] = dataRows
          .filter((r) => r && r.length > 0 && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ''))
          .map((r) => {
            const nis = String(r[0] || '').trim();
            const nisn = String(r[1] || '').trim();
            const fullName = String(r[2] || '').trim();
            const rawGender = String(r[3] || '').trim().toUpperCase();
            const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' ? 'P' : 'L';
            const className = String(r[4] || '1A').trim().toUpperCase();
            const academicYear = String(r[5] || schoolSettings?.academicYear || '2024/2025').trim();
            const rawStatus = String(r[6] || 'active').trim().toLowerCase();
            const status: 'active' | 'inactive' = rawStatus === 'inactive' ? 'inactive' : 'active';

            const isValid = nis.length > 0 && fullName.length > 0;
            return {
              nis,
              nisn,
              fullName,
              gender,
              className,
              academicYear,
              status,
              isValid,
              notes: !isValid ? 'NIS dan Nama Siswa wajib terisi' : undefined,
            };
          });

        setParsedStudentRows(parsed);
        setIsBulkModalOpen(true);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + (err.message || 'Format tidak didukung'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTeacherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkType('teacher');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          alert('File kosong atau tidak memiliki baris data.');
          return;
        }

        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawJson.length, 5); i++) {
          const rowStr = (rawJson[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('guru') || rowStr.includes('nip') || rowStr.includes('nama')) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = rawJson.slice(headerRowIndex + 1);
        const parsed: ParsedTeacherRow[] = dataRows
          .filter((r) => r && r.length > 0 && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ''))
          .map((r) => {
            const nip = String(r[0] || '').trim();
            const fullName = String(r[1] || '').trim();
            const email = String(r[2] || '').trim();
            const subjectNames = String(r[3] || '').trim();
            const assignedClasses = String(r[4] || '').trim();
            const rawStatus = String(r[5] || 'active').trim().toLowerCase();
            const status: 'active' | 'inactive' = rawStatus === 'inactive' ? 'inactive' : 'active';

            const isValid = fullName.length > 0;
            return {
              nip,
              fullName,
              email,
              subjectNames,
              assignedClasses,
              status,
              isValid,
              notes: !isValid ? 'Nama Lengkap Guru wajib terisi' : undefined,
            };
          });

        setParsedTeacherRows(parsed);
        setIsBulkModalOpen(true);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + (err.message || 'Format tidak didukung'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteBulkImport = async () => {
    setBulkImporting(true);
    try {
      if (bulkType === 'student') {
        const valid = parsedStudentRows.filter((r) => r.isValid);
        if (valid.length === 0) {
          alert('Tidak ada data siswa valid.');
          return;
        }
        const res = await api.master.bulkImportStudents(valid);
        alert(`Berhasil mengimpor ${res.importedCount || valid.length} data siswa ke database sekolah!`);
      } else {
        const valid = parsedTeacherRows.filter((r) => r.isValid);
        if (valid.length === 0) {
          alert('Tidak ada data guru valid.');
          return;
        }
        const res = await api.master.bulkImportTeachers(valid);
        alert(`Berhasil mengimpor ${res.importedCount || valid.length} data guru ke database sekolah!`);
      }
      setIsBulkModalOpen(false);
      setParsedStudentRows([]);
      setParsedTeacherRows([]);
      setBulkFile(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan impor data.');
    } finally {
      setBulkImporting(false);
    }
  };

  // ==========================================
  // SINGLE ADD / EDIT MODAL LOGIC
  // ==========================================
  const openAddModal = (type: 'student' | 'teacher' | 'class' | 'subject') => {
    setModalType(type);
    setEditItem(null);
    setSubmitError(null);
    if (type === 'student') {
      setFormData({
        nis: '',
        nisn: '',
        fullName: '',
        gender: 'L',
        classId: classes[0]?.classId || 'cls_1a',
        academicYear: schoolSettings?.academicYear || '2024/2025',
        status: 'active',
      });
    } else if (type === 'teacher') {
      setFormData({
        nip: '',
        fullName: '',
        email: '',
        subjectIds: [],
        assignedClassIds: [],
        status: 'active',
      });
    } else if (type === 'class') {
      setFormData({
        className: '',
        grade: 'I',
        academicYear: schoolSettings?.academicYear || '2024/2025',
        homeroomTeacherId: '',
        studentCount: 0,
      });
    } else if (type === 'subject') {
      setFormData({
        subjectCode: '',
        subjectName: '',
        gradeLevels: ['I', 'II', 'III', 'IV', 'V', 'VI'],
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'student' | 'teacher' | 'class' | 'subject', item: any) => {
    setModalType(type);
    setEditItem(item);
    setSubmitError(null);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (type: 'student' | 'teacher' | 'subject', item: any) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      if (type === 'student') {
        await api.master.saveStudent({ status: nextStatus }, item.studentId);
      } else if (type === 'teacher') {
        await api.master.saveTeacher({ status: nextStatus }, item.teacherId);
      } else if (type === 'subject') {
        await api.master.saveSubject({ status: nextStatus }, item.subjectId);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status.');
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      if (modalType === 'student') {
        const id = editItem ? editItem.studentId : undefined;
        await api.master.saveStudent(formData, id);
      } else if (modalType === 'teacher') {
        const id = editItem ? editItem.teacherId : undefined;
        await api.master.saveTeacher(formData, id);
      } else if (modalType === 'class') {
        const id = editItem ? editItem.classId : undefined;
        await api.master.saveClass(formData, id);
      } else if (modalType === 'subject') {
        const id = editItem ? editItem.subjectId : undefined;
        await api.master.saveSubject(formData, id);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menyimpan data.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSettings) return;
    try {
      await api.master.updateSettings(schoolSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan sekolah.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
              <School className="w-5 h-5 text-[#D4AF37]" /> Master Data Sekolah & 12 Rombel
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#071D49] font-black text-[10px]">
              12 Rombel Aktif (1A - 6B)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SD XAVERIUS A1 AMBON • Kelola data siswa, dewan guru, 12 rombongan belajar (1A-6B), kurikulum, dan kalender pendidikan.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'students' ? 'bg-[#071D49] text-white shadow-sm' : 'text-slate-600 hover:text-[#071D49]'
            }`}
          >
            Siswa ({students.length})
          </button>
          <button
            onClick={() => setActiveSubTab('teachers')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'teachers' ? 'bg-[#071D49] text-white shadow-sm' : 'text-slate-600 hover:text-[#071D49]'
            }`}
          >
            Guru ({teachers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'classes' ? 'bg-[#071D49] text-white shadow-sm' : 'text-slate-600 hover:text-[#071D49]'
            }`}
          >
            Kelas 12 Rombel ({classes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'subjects' ? 'bg-[#071D49] text-white shadow-sm' : 'text-slate-600 hover:text-[#071D49]'
            }`}
          >
            Mata Pelajaran ({subjects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'settings' ? 'bg-[#071D49] text-white shadow-sm' : 'text-slate-600 hover:text-[#071D49]'
            }`}
          >
            Identitas & Semester
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB: DATA SISWA                                       */}
      {/* ======================================================== */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa (NIS, Nama, Kelas)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071D49]"
              />
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadStudentTemplate}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-emerald-300 shadow-2xs cursor-pointer"
                  title="Unduh template resmi Microsoft Excel (.xlsx) data siswa 12 rombel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Unduh Template (.xlsx)</span>
                </button>

                <label className="px-3 py-2 bg-[#5BA5D5] hover:bg-[#4A94C4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Unggah & Impor Siswa</span>
                  <input
                    type="file"
                    ref={studentFileInputRef}
                    accept=".xlsx, .xls, .xml, .csv"
                    onChange={handleStudentFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => openAddModal('student')}
                  className="px-4 py-2 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Siswa Baru
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NIS / NISN</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">L/P</th>
                  <th className="py-3 px-4">Rombel Kelas</th>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                      <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 text-xs">Belum ada data siswa terdaftar.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Unduh template Excel biasa <strong>"Unduh Template (.xlsx)"</strong> lalu isi dan klik <strong>"Unggah & Impor Siswa"</strong>.
                      </p>
                      {isAdmin && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            onClick={handleDownloadStudentTemplate}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-xl hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Template Excel
                          </button>
                          <button
                            onClick={() => openAddModal('student')}
                            className="px-3.5 py-1.5 bg-[#071D49] text-white text-[11px] font-bold rounded-xl hover:bg-[#0A2255] cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" /> Input Manual
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  students
                    .filter(
                      (s) =>
                        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.nis.includes(searchQuery) ||
                        (s.className && s.className.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((s) => (
                      <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#071D49]">
                          {s.nis} <span className="text-[10px] text-slate-400">/ {s.nisn || '-'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold">{s.fullName}</td>
                        <td className="py-3 px-4 font-bold">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="py-3 px-4 font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            {s.className || s.classId}
                          </span>
                        </td>
                        <td className="py-3 px-4">{s.academicYear}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => openEditModal('student', s)}
                              className="p-1.5 text-slate-600 hover:text-[#071D49] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus('student', s)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                s.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={s.status === 'active' ? 'Nonaktifkan Siswa' : 'Aktifkan Siswa'}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB: DATA DEWAN GURU                                  */}
      {/* ======================================================== */}
      {activeSubTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru (NIP, Nama)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071D49]"
              />
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadTeacherTemplate}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-emerald-300 shadow-2xs cursor-pointer"
                  title="Unduh template resmi Microsoft Excel (.xlsx) dewan guru"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Unduh Template (.xlsx)</span>
                </button>

                <label className="px-3 py-2 bg-[#5BA5D5] hover:bg-[#4A94C4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Unggah & Impor Guru</span>
                  <input
                    type="file"
                    ref={teacherFileInputRef}
                    accept=".xlsx, .xls, .xml, .csv"
                    onChange={handleTeacherFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => openAddModal('teacher')}
                  className="px-4 py-2 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Guru Baru
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email Resmi</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 text-xs">Belum ada data dewan guru terdaftar.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Unduh template Excel <strong>"Unduh Template (.xlsx)"</strong> lalu unggah untuk mendaftarkan seluruh dewan guru.
                      </p>
                      {isAdmin && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            onClick={handleDownloadTeacherTemplate}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-xl hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Template Guru
                          </button>
                          <button
                            onClick={() => openAddModal('teacher')}
                            className="px-3.5 py-1.5 bg-[#071D49] text-white text-[11px] font-bold rounded-xl hover:bg-[#0A2255] cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" /> Input Manual
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  teachers
                    .filter((t) => t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || (t.nip && t.nip.includes(searchQuery)))
                    .map((t) => (
                      <tr key={t.teacherId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-[#071D49]">{t.nip || '-'}</td>
                        <td className="py-3 px-4 font-bold">{t.fullName}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{t.email || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {t.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => openEditModal('teacher', t)}
                              className="p-1.5 text-slate-600 hover:text-[#071D49] hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus('teacher', t)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB: 12 ROMBONGAN BELAJAR (1A, 1B - 6A, 6B)           */}
      {/* ======================================================== */}
      {activeSubTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" /> 12 Rombongan Belajar (Rombel 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Struktur kelas resmi SD Xaverius A1 Ambon yang terhubung ke jadwal ujian, akun siswa, dan penugasan pengawas.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => openAddModal('class')}
                className="px-4 py-2 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Rombel Baru
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {classes.map((c) => (
              <div
                key={c.classId}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#D4AF37] transition-all bg-slate-50/50 hover:bg-white shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#071D49] text-white">
                    Tingkat {c.grade}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{c.studentCount || 0} Siswa</span>
                </div>
                <h4 className="text-base font-black text-[#071D49]">{c.className}</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Wali Kelas: <span className="font-semibold text-slate-700">{c.homeroomTeacherName || 'Belum ditentukan'}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tahun Ajaran: {c.academicYear}</p>
                {isAdmin && (
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => openEditModal('class', c)}
                      className="text-xs font-bold text-[#071D49] hover:text-[#5BA5D5] flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" /> Edit Kelas
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB: MATA PELAJARAN                                   */}
      {/* ======================================================== */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Mata Pelajaran Sekolah</h3>
            {isAdmin && (
              <button
                onClick={() => openAddModal('subject')}
                className="px-4 py-2 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" /> Tambah Mata Pelajaran
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4">Tingkat Kelas</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.subjectId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-[#071D49]">{sub.subjectCode}</td>
                    <td className="py-3 px-4 font-bold">{sub.subjectName}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.gradeLevels?.map((g) => (
                          <span key={g} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sub.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal('subject', sub)}
                          className="p-1.5 text-slate-600 hover:text-[#071D49] hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus('subject', sub)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB: SETTINGS IDENTITAS SEKOLAH                       */}
      {/* ======================================================== */}
      {activeSubTab === 'settings' && schoolSettings && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <h3 className="font-bold text-sm text-[#071D49] mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#D4AF37]" /> Pengaturan Identitas Sekolah & Kalender Akademik
          </h3>

          {saveSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan ke Cloud Database.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={schoolSettings.schoolName}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold text-[#071D49]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran Aktif</label>
                <select
                  disabled={!isAdmin}
                  value={schoolSettings.academicYear}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
                <select
                  disabled={!isAdmin}
                  value={schoolSettings.semester}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, semester: e.target.value as any })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Sekolah</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={schoolSettings.schoolAddress}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolAddress: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kontak / Telepon / Email</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={schoolSettings.contactInformation}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, contactInformation: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={schoolSettings.headmasterName}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, headmasterName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={schoolSettings.headmasterNip}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, headmasterNip: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" /> Simpan Pengaturan Sekolah
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BULK IMPORT SISWA / GURU VIA EXCEL (.xlsx)        */}
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
                  <h3 className="font-bold text-sm">
                    Pratinjau Impor Massal Data {bulkType === 'student' ? 'Siswa (12 Rombel)' : 'Dewan Guru'} (.xlsx)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    File: <span className="font-mono text-[#D4AF37]">{bulkFile?.name}</span> • Total{' '}
                    {bulkType === 'student' ? parsedStudentRows.length : parsedTeacherRows.length} baris
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setParsedStudentRows([]);
                  setParsedTeacherRows([]);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Valid:{' '}
                    <strong>
                      {bulkType === 'student'
                        ? parsedStudentRows.filter((r) => r.isValid).length
                        : parsedTeacherRows.filter((r) => r.isValid).length}
                    </strong>{' '}
                    data siap dimasukkan ke master data sekolah.
                  </span>
                </div>
                <button
                  onClick={bulkType === 'student' ? handleDownloadStudentTemplate : handleDownloadTeacherTemplate}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Template
                </button>
              </div>

              {bulkType === 'student' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">NIS</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">L/P</th>
                        <th className="py-2.5 px-3">Rombel Kelas</th>
                        <th className="py-2.5 px-3">Tahun Ajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedStudentRows.map((r, i) => (
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
                          <td className="py-2 px-3 font-mono font-bold text-[#071D49]">{r.nis}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{r.nisn || '-'}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{r.fullName}</td>
                          <td className="py-2 px-3">{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td className="py-2 px-3 font-bold text-blue-700">{r.className}</td>
                          <td className="py-2 px-3 text-slate-600">{r.academicYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">NIP</th>
                        <th className="py-2.5 px-3">Nama Lengkap Guru</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Mapel</th>
                        <th className="py-2.5 px-3">Rombel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedTeacherRows.map((r, i) => (
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
                          <td className="py-2 px-3 font-mono font-bold text-[#071D49]">{r.nip || '-'}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{r.fullName}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{r.email || '-'}</td>
                          <td className="py-2 px-3 text-slate-700">{r.subjectNames || '-'}</td>
                          <td className="py-2 px-3 text-blue-700 font-semibold">{r.assignedClasses || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Format didukung: <strong>.xlsx (Excel biasa), .xls, .xml, .csv</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setParsedStudentRows([]);
                    setParsedTeacherRows([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={
                    bulkImporting ||
                    (bulkType === 'student'
                      ? parsedStudentRows.filter((r) => r.isValid).length === 0
                      : parsedTeacherRows.filter((r) => r.isValid).length === 0)
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {bulkImporting ? (
                    <span>Menyimpan ke Database...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-100" />
                      <span>
                        Simpan Data{' '}
                        {bulkType === 'student'
                          ? parsedStudentRows.filter((r) => r.isValid).length
                          : parsedTeacherRows.filter((r) => r.isValid).length}{' '}
                        {bulkType === 'student' ? 'Siswa' : 'Guru'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SINGLE ADD / EDIT ITEM                            */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editItem ? 'Edit Data' : 'Tambah Data Baru'} ({modalType?.toUpperCase()})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4 text-xs">
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {modalType === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        NIS <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nis || ''}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NISN</label>
                      <input
                        type="text"
                        value={formData.nisn || ''}
                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Siswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={formData.gender || 'L'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Rombel Kelas (1A - 6B)</label>
                      <select
                        value={formData.classId || ''}
                        onChange={(e) => {
                          const cls = classes.find((c) => c.classId === e.target.value);
                          setFormData({ ...formData, classId: e.target.value, className: cls?.className });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                      >
                        {classes.map((c) => (
                          <option key={c.classId} value={c.classId}>
                            {c.className}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'teacher' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK Guru</label>
                    <input
                      type="text"
                      value={formData.nip || ''}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Guru (dengan gelar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </>
              )}

              {modalType === 'class' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tingkat Kelas <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.grade || 'I'}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      >
                        {['I', 'II', 'III', 'IV', 'V', 'VI'].map((g) => (
                          <option key={g} value={g}>
                            Kelas {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Rombel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kelas 1A"
                        value={formData.className || ''}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Wali Kelas</label>
                    <input
                      type="text"
                      placeholder="Nama guru wali kelas..."
                      value={formData.homeroomTeacherName || ''}
                      onChange={(e) => setFormData({ ...formData, homeroomTeacherName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </>
              )}

              {modalType === 'subject' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Kode Mapel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: MAT-03"
                        value={formData.subjectCode || ''}
                        onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Matematika"
                      value={formData.subjectName || ''}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </>
              )}

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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
