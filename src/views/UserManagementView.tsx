/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { User, UserRole, UserStatus } from '../types';
import {
  Users,
  Plus,
  Pencil,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  ShieldCheck,
  Download,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Info,
  X,
} from 'lucide-react';

interface ParsedAccountRow {
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  password: string;
  status: UserStatus;
  isValid: boolean;
  error?: string;
}

export const UserManagementView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  // Bulk Import State
  const [parsedAccounts, setParsedAccounts] = useState<ParsedAccountRow[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  // Add Form
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formError, setFormError] = useState<string | null>(null);

  // Reset Form
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers();
      setUsers(res.users || []);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formPassword.length < 6) {
      setFormError('Password minimal harus 6 karakter.');
      return;
    }

    try {
      await api.admin.createUser({
        username: formUsername,
        password: formPassword,
        fullName: formFullName,
        email: formEmail,
        role: formRole,
        status: formStatus,
      });
      setIsAddModalOpen(false);
      setFormUsername('');
      setFormPassword('');
      setFormFullName('');
      setFormEmail('');
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat pengguna baru.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.admin.updateUser(user.uid, { status: nextStatus });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pengguna.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    if (newResetPassword.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }

    try {
      await api.admin.resetPassword(targetUser.uid, newResetPassword);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setIsResetModalOpen(false);
        setNewResetPassword('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal mereset password.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = selectedRole === 'all' || u.role === selectedRole;
    return matchQuery && matchRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'guru':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pengawas':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'siswa':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // ==========================================
  // EXCEL TEMPLATE DOWNLOAD & BULK IMPORT
  // ==========================================
  const handleDownloadTemplate = () => {
    const headers = [
      'Username (Tanpa Spasi)',
      'Nama Lengkap',
      'Role (admin / guru / siswa / pengawas)',
      'Email (Opsional)',
      'Password Default (Min 6 Karakter)',
      'Status (active / inactive)',
    ];

    const sampleRows = [
      ['guru_maria', 'Maria Regina, S.Pd.', 'guru', 'guru.maria@xaverius.sch.id', 'GuruXav2025!', 'active'],
      ['guru_yohanes', 'Yohanes Lerebulan, S.Pd.', 'guru', 'guru.yohanes@xaverius.sch.id', 'GuruXav2025!', 'active'],
      ['siswa_6a_01', 'Alexander Titahena', 'siswa', '', 'SiswaXav123', 'active'],
      ['siswa_6a_02', 'Bernadetta Rahawarin', 'siswa', '', 'SiswaXav123', 'active'],
      ['siswa_6b_01', 'Fransiskus Pattiradjawane', 'siswa', '', 'SiswaXav123', 'active'],
      ['pengawas_lab1', 'Fransiscus Renyaan, S.Pd.', 'pengawas', 'pengawas1@xaverius.sch.id', 'PengawasXav2025!', 'active'],
      ['pengawas_lab2', 'Petrus Titaley, S.Pd.', 'pengawas', 'pengawas2@xaverius.sch.id', 'PengawasXav2025!', 'active'],
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Daftar_Akun
    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 24 }, // Username
      { wch: 32 }, // Nama Lengkap
      { wch: 36 }, // Role
      { wch: 32 }, // Email
      { wch: 32 }, // Password
      { wch: 22 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar_Akun');

    // Sheet 2: Petunjuk_Pengisian
    const petunjukData = [
      ['PANDUAN IMPORT MASSAL AKUN PENGGUNA - SD XAVERIUS A1 AMBON'],
      [''],
      ['No', 'Nama Kolom', 'Ketentuan Pengisian', 'Contoh Nilai'],
      ['1', 'Username', 'Wajib diisi, huruf kecil/angka/garis bawah tanpa spasi.', 'guru_maria, siswa_6a_01'],
      ['2', 'Nama Lengkap', 'Wajib diisi dengan nama lengkap resmi pengguna.', 'Alexander Titahena'],
      ['3', 'Role', 'Wajib salah satu dari: "admin", "guru", "siswa", "pengawas".', 'guru atau siswa'],
      ['4', 'Email', 'Opsional, dapat dikosongkan terutama untuk siswa.', 'siswa@xaverius.sch.id'],
      ['5', 'Password Default', 'Minimal 6 karakter. Bila dikosongkan otomatis diberi "Xaverius2025!".', 'SiswaXav123'],
      ['6', 'Status', 'Isi "active" agar akun langsung aktif, atau "inactive" untuk nonaktif.', 'active'],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 55 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Akun_Pengguna_SD_Xaverius_A1.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('akun')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

        if (!matrix || matrix.length === 0) {
          setParsedAccounts([]);
          return;
        }

        const firstRow = matrix[0].map((c) => String(c ?? '').toLowerCase());
        const isHeader = firstRow.some((c) => c.includes('user') || c.includes('nama') || c.includes('role'));
        const dataRows = isHeader ? matrix.slice(1) : matrix;

        const parsed: ParsedAccountRow[] = dataRows
          .filter((row) => row && row.some((c) => String(c ?? '').trim().length > 0))
          .map((cols, idx) => {
            const rawUser = String(cols[0] ?? '').trim().toLowerCase().replace(/\s+/g, '_');
            const rawName = String(cols[1] ?? '').trim() || `Pengguna Baru #${idx + 1}`;
            const rawRoleStr = String(cols[2] ?? '').trim().toLowerCase();
            let role: UserRole = 'guru';
            if (rawRoleStr.includes('admin')) role = 'admin';
            else if (rawRoleStr.includes('siswa') || rawRoleStr.includes('murid')) role = 'siswa';
            else if (rawRoleStr.includes('pengawas') || rawRoleStr.includes('proctor')) role = 'pengawas';
            else role = 'guru';

            const email = String(cols[3] ?? '').trim();
            const password = String(cols[4] ?? '').trim() || 'Xaverius2025!';
            const status: UserStatus = String(cols[5] ?? 'active').toLowerCase().includes('inact')
              ? 'inactive'
              : 'active';

            const isValid = rawUser.length >= 3 && rawName.length > 0;
            const error = !rawUser
              ? 'Username wajib diisi'
              : rawUser.length < 3
              ? 'Username min 3 huruf'
              : undefined;

            return {
              username: rawUser,
              fullName: rawName,
              role,
              email,
              password,
              status,
              isValid,
              error,
            };
          });

        setParsedAccounts(parsed);
      } catch (err: any) {
        alert('Gagal membaca file spreadsheet. Pastikan file dalam format .xlsx atau .xls.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleExecuteImport = async () => {
    if (parsedAccounts.length === 0) {
      alert('Belum ada akun yang valid untuk diimpor.');
      return;
    }

    setImportLoading(true);
    try {
      const payload = parsedAccounts.filter((a) => a.isValid);
      const res = await api.admin.bulkImportUsers(payload);
      alert(res.message || `Berhasil mengimpor ${payload.length} akun pengguna.`);
      setIsImportModalOpen(false);
      setParsedAccounts([]);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor akun.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" /> Manajemen Pengguna & Kontrol Akses (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan 4 jenis akun: Administrator, Dewan Guru, Peserta Siswa, dan Pengawas Ujian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-emerald-300 shadow-2xs cursor-pointer"
            title="Unduh template Excel resmi untuk input massal akun pengguna"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Unduh Template (.xlsx)</span>
          </button>

          <button
            onClick={() => {
              setParsedAccounts([]);
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-[#5BA5D5] hover:bg-[#4A94C4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            title="Unggah template Excel akun pengguna"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Unggah & Impor Akun</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#071D49] text-white text-xs font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Buat Akun Satuan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari username atau nama lengkap..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071D49]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="guru">Guru</option>
            <option value="siswa">Siswa</option>
            <option value="pengawas">Pengawas</option>
          </select>
        </div>

        <span className="ml-auto text-slate-500 font-medium">
          Total Akun: {filteredUsers.length} pengguna
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username Akun</th>
                <th className="py-3 px-4">Role Pengguna</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-[#071D49]">{u.fullName}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-600">@{u.username}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{u.email || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setTargetUser(u);
                        setIsResetModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-[#071D49] hover:bg-slate-100 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      title="Reset Password Akun"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Reset Password</span>
                    </button>

                    {u.uid !== currentUser?.uid && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          u.status === 'active'
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                      >
                        {u.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 mb-1">Belum ada akun untuk kategori ini</p>
                    <p className="text-[11px] text-slate-400">
                      Gunakan tombol <strong>"Buat Akun Pengguna Baru"</strong> di atas untuk mendaftarkan akun guru, siswa, atau pengawas baru.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Akun Pengguna Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Stefanus Huliselan"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: stefanus_h"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Role Akun <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="guru">Dewan Guru</option>
                    <option value="siswa">Peserta Siswa</option>
                    <option value="pengawas">Pengawas CBT</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password Awal <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter..."
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Password akan dienkripsi menggunakan bcrypt dengan salt rounds aman di server.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="email@xaverius.sch.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] shadow-md"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Reset Password Akun</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-300 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4 text-xs">
              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password berhasil direset dan disimpan ke database!</span>
                </div>
              )}

              <div>
                <p className="text-slate-500 mb-1">Target Pengguna:</p>
                <p className="font-bold text-sm text-[#071D49]">
                  {targetUser.fullName} (@{targetUser.username})
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Baru:</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password baru..."
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] shadow-md"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal 3: Bulk Import Users from Excel (.xlsx) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Unggah & Impor Akun Pengguna (Excel .xlsx)</h3>
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
                  <h4 className="font-bold text-[#071D49]">Panduan Impor Akun Massal (Excel):</h4>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 leading-relaxed">
                    <li>
                      Klik tombol <strong>"Unduh Template (.xlsx)"</strong> untuk mengunduh template spreadsheet resmi.
                    </li>
                    <li>
                      Buka file tersebut di <strong>Microsoft Excel</strong>. Masukkan username, nama lengkap, role (admin, guru, siswa, pengawas), dan password.
                    </li>
                    <li>
                      Unggah file <strong>.xlsx</strong> Anda pada kotak di bawah.
                    </li>
                    <li>
                      Periksa tabel pratinjau hasil pembacaan, lalu klik <strong>"Daftarkan Akun Pengguna"</strong>.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-6 text-center flex flex-col items-center justify-center bg-emerald-50/20 transition-all">
                <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="font-bold text-slate-800 mb-0.5">Pilih File Excel Akun Pengguna</p>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] mb-3">
                  Format Microsoft Excel (.xlsx / .xls)
                </span>
                <label className="px-4 py-2 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pilih File Excel dari Komputer</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .xml, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Table Preview */}
              {parsedAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071D49] text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      Pratinjau Akun ({parsedAccounts.length} Baris Terdeteksi):
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {parsedAccounts.filter((a) => a.role === 'guru').length} Guru
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                        {parsedAccounts.filter((a) => a.role === 'siswa').length} Siswa
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {parsedAccounts.filter((a) => a.role === 'pengawas').length} Pengawas
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-[#071D49] text-white sticky top-0">
                        <tr>
                          <th className="p-2.5 font-bold">No</th>
                          <th className="p-2.5 font-bold">Username</th>
                          <th className="p-2.5 font-bold">Nama Lengkap</th>
                          <th className="p-2.5 font-bold">Role</th>
                          <th className="p-2.5 font-bold">Password Default</th>
                          <th className="p-2.5 font-bold">Status</th>
                          <th className="p-2.5 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedAccounts.map((acc, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-2.5 font-mono font-bold text-[#071D49]">{acc.username}</td>
                            <td className="p-2.5 font-bold text-slate-800">{acc.fullName}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] border ${getRoleBadge(acc.role)}`}>
                                {acc.role}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-500">••••••••</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                {acc.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setParsedAccounts((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Hapus baris ini"
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
                  disabled={parsedAccounts.length === 0 || importLoading}
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 bg-[#071D49] text-white font-bold rounded-xl hover:bg-[#0A2255] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importLoading ? (
                    <span>Sedang Mendaftarkan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>Daftarkan {parsedAccounts.length} Akun Pengguna</span>
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
