/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Shield,
  GraduationCap,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  FileQuestion,
  CalendarCheck,
  Search,
  Printer,
  ChevronRight,
  Database,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react';

export const GuideView: React.FC = () => {
  const { user } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'guru' | 'siswa' | 'pengawas' | 'troubleshoot'>(
    user?.role || 'guru'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" /> Buku Petunjuk Penggunaan Sistem (User Manual)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#071D49] text-[10px] font-bold border border-blue-200">
              Edisi Resmi 2025
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Panduan operasional lengkap untuk Administrator, Dewan Guru, Peserta Siswa, dan Pengawas Ujian SD Xaverius A1 Ambon.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-[#071D49]" /> Cetak / Unduh PDF Panduan
        </button>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          onClick={() => setActiveRoleTab('admin')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRoleTab === 'admin'
              ? 'bg-[#071D49] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <span>1. Petunjuk Admin</span>
        </button>

        <button
          onClick={() => setActiveRoleTab('guru')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRoleTab === 'guru'
              ? 'bg-[#071D49] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-[#5BA5D5]" />
          <span>2. Petunjuk Guru</span>
        </button>

        <button
          onClick={() => setActiveRoleTab('siswa')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRoleTab === 'siswa'
              ? 'bg-[#071D49] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>3. Petunjuk Siswa</span>
        </button>

        <button
          onClick={() => setActiveRoleTab('pengawas')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRoleTab === 'pengawas'
              ? 'bg-[#071D49] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>4. Petunjuk Pengawas</span>
        </button>

        <button
          onClick={() => setActiveRoleTab('troubleshoot')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRoleTab === 'troubleshoot'
              ? 'bg-[#071D49] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>5. Bantuan & FAQ</span>
        </button>
      </div>

      {/* Guide Content Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* ======================= 1. PETUNJUK ADMINISTRATOR ======================= */}
        {activeRoleTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-red-100 text-red-900 border border-red-200">
                Hak Akses: ADMINISTRATOR UTAMA
              </span>
              <h3 className="text-xl font-black text-[#071D49] mt-2">
                Panduan Operasional Administrator Sistem Xaverius Exam
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Administrator memiliki hak akses tertinggi untuk konfigurasi master data sekolah, manajemen pengguna, pemulihan akun, pengawasan jadwal, dan peninjauan log audit keamanan.
              </p>
            </div>

            {/* Sub-sections */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#D4AF37]" /> A. Pengelolaan Data Master Sekolah
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li>
                    <strong>Tahun Pelajaran & Semester:</strong> Buka menu <em>Data Master Sekolah</em> &gt; tab <em>Identitas & Semester</em>. Tentukan Tahun Pelajaran (misal: 2024/2025) dan Semester aktif (Ganjil/Genap), lalu klik <strong>Simpan Pengaturan Sekolah</strong>.
                  </li>
                  <li>
                    <strong>Rombongan Belajar (Kelas I-VI):</strong> Di tab <em>Kelas I-VI</em>, Admin dapat menambah rombel baru (1A, 1B, ..., 6B), menugaskan guru wali kelas, dan mengelola kapasitas siswa.
                  </li>
                  <li>
                    <strong>Mata Pelajaran:</strong> Di tab <em>Mata Pelajaran</em>, tambahkan kode mapel resmi (PAK-01, BIN-02, MAT-03, dll.) serta status aktif/nonaktif.
                  </li>
                  <li>
                    <strong>Data Siswa & Guru:</strong> Admin dapat menambah data siswa (NIS, NISN, nama, kelas) serta guru (NIP, nama, mapel yang diampu).
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> B. Fitur Unggulan: Unduh & Unggah Template Excel Biasa (.xlsx)
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Sistem kini dilengkapi dengan template <strong>Microsoft Excel Biasa (.xlsx)</strong> di seluruh modul utama sehingga pihak sekolah dapat mengunduh formulir, mengisi data secara offline di komputer tanpa koneksi internet, lalu mengunggah kembali untuk pemrosesan instan:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs text-xs space-y-1">
                    <p className="font-bold text-[#071D49]">1. Manajemen Akun Pengguna (.xlsx)</p>
                    <p className="text-slate-600 text-[11px]">
                      Menu <em>Manajemen Akun & Role</em> &gt; Klik <strong>"Unduh Template (.xlsx)"</strong>. Berisi kolom Nama, Username, Password Awal, dan Peran (admin, guru, siswa, pengawas). Unggah untuk mendaftarkan ratusan akun sekaligus dengan enkripsi bcrypt server.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs text-xs space-y-1">
                    <p className="font-bold text-[#071D49]">2. Jadwal Ujian 12 Rombel (.xlsx & .xml)</p>
                    <p className="text-slate-600 text-[11px]">
                      Menu <em>Paket & Jadwal Ujian</em> &gt; Klik <strong>"Unduh Template (.xlsx)"</strong>. Memuat 12 rombel lengkap (1A - 6B), mapel, alokasi jam, dan token. Unggah untuk mengaktifkan seluruh jadwal ujian semester.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs text-xs space-y-1">
                    <p className="font-bold text-[#071D49]">3. Penugasan Pengawas Ruang (.xlsx)</p>
                    <p className="text-slate-600 text-[11px]">
                      Menu <em>Pengawasan Ujian</em> &gt; Tab <em>Penugasan Pengawas Ruang</em> &gt; Klik <strong>"Unduh Template (.xlsx)"</strong>. Cantumkan ruang ujian, nama pengawas, NIP, kontak HP, dan kelas rombel yang diawasi.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs text-xs space-y-1">
                    <p className="font-bold text-[#071D49]">4. Master Data Siswa & Guru (.xlsx)</p>
                    <p className="text-slate-600 text-[11px]">
                      Menu <em>Master Data Sekolah</em> &gt; Tab <em>Siswa</em> atau <em>Guru</em> &gt; Klik <strong>"Unduh Template (.xlsx)"</strong>. Dilengkapi lembar referensi otomatis untuk 12 rombel (1A-6B).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#5BA5D5]" /> C. Manajemen Akun Pengguna & Kontrol Role (RBAC)
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li>
                    Buka menu <strong>Manajemen Akun & Role</strong> di sidebar kiri.
                  </li>
                  <li>
                    Klik tombol <strong>Unduh Template (.xlsx)</strong> untuk menginput ratusan akun secara massal, atau klik <strong>Buat Akun Satuan</strong> untuk membuat satu akun pengguna baru secara langsung.
                  </li>
                  <li>
                    <strong>Reset Password Akun:</strong> Jika ada guru, siswa, atau pengawas yang lupa password, cari nama pengguna pada tabel, lalu klik tombol <strong>Reset Password</strong>. Masukkan password baru yang akan dienkripsi dengan bcrypt di server.
                  </li>
                  <li>
                    <strong>Nonaktifkan Akun:</strong> Klik ikon status pada kolom aksi jika ingin menangguhkan akses akun tanpa menghapus riwayat datanya.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> D. Pemantauan Log Audit Keamanan
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Buka menu <strong>Log Audit Keamanan</strong> untuk memeriksa jejak digital yang tidak dapat dimanipulasi (*immutable*). Setiap aktivitas seperti login, logout, perubahan role, pengeditan data siswa/guru, serta pembuatan butir soal tercatat dengan timestamp akurat beserta nama pelaku (actor).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= 2. PETUNJUK DEWAN GURU ======================= */}
        {activeRoleTab === 'guru' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                Hak Akses: DEWAN GURU
              </span>
              <h3 className="text-xl font-black text-[#071D49] mt-2">
                Panduan Operasional Dewan Guru SD Xaverius A1 Ambon
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Guru berwenang membuat dan menyusun bank soal (5 tipe soal), merancang paket ujian, menerbitkan token ujian, serta melihat rekapitulasi nilai siswa.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-[#D4AF37]" /> A. Mengelola Bank Soal (5 Tipe Soal CBT)
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li>
                    Buka menu <strong>Bank Soal CBT</strong> dan klik <strong>Tambah Butir Soal Baru</strong>.
                  </li>
                  <li>
                    Pilih salah satu dari 5 tipe butir soal yang disediakan:
                    <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-1">
                      <li><strong>Pilihan Ganda Biasa:</strong> Input opsi A, B, C, D dan pilih salah satu radio button sebagai kunci jawaban benar.</li>
                      <li><strong>Pilihan Ganda Kompleks:</strong> Centang satu atau lebih kotak pilihan yang merupakan jawaban benar.</li>
                      <li><strong>Menjodohkan (*Matching*):</strong> Masukkan pasangan premis di sisi kiri (misal: "Sayap Burung") dan respon jawaban di sisi kanan (misal: "Terbang di udara").</li>
                      <li><strong>Benar / Salah:</strong> Masukkan pernyataan dan tentukan kuncinya apakah "BENAR" atau "SALAH".</li>
                      <li><strong>Uraian / Isian Singkat:</strong> Tuliskan kata kunci jawaban yang diterima serta rubrik pedoman penskoran.</li>
                    </ul>
                  </li>
                  <li>
                    Tentukan bobot skor (misal: 20 poin per soal) dan tingkat kesulitan (Mudah, Sedang, Sulit), lalu klik <strong>Simpan ke Bank Soal</strong>.
                  </li>
                  <li>
                    Gunakan tombol ikon mata untuk melihat <strong>Pratinjau Soal</strong> sebelum diujikan kepada siswa.
                  </li>
                </ol>
              </div>

              {/* Panduan Memasukkan Gambar */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-[#D4AF37]/50 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> B. Panduan Memasukkan Gambar ke Dalam Pertanyaan Soal
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Jika butir soal membutuhkan ilustrasi pertanyaan (seperti peta buta, teks bacaan, grafik, atau diagram utama):
                </p>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li>
                    <strong>Unggah File Langsung:</strong> Klik tombol <strong>"Upload File dari Komputer / HP"</strong>. Gambar (JPG/PNG/WebP, maks 3MB) akan otomatis terpasang.
                  </li>
                  <li>
                    <strong>Tautan URL Gambar:</strong> Anda juga dapat menempelkan link gambar web publik pada kolom <em>"Tempel tautan URL gambar..."</em> dan klik <strong>+ Tambah URL</strong>.
                  </li>
                  <li>
                    <strong>Pratinjau & Hapus:</strong> Klik ikon tempat sampah merah pada pojok thumbnail gambar jika ingin menghapus lampiran.
                  </li>
                </ol>
              </div>

              {/* Panduan Memasukkan Gambar pada Opsi A, B, C, D */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-[#5BA5D5]/50 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#5BA5D5]" /> C. Panduan Memasukkan Gambar pada Setiap Opsi Jawaban (A, B, C, D)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Sangat cocok untuk soal Sekolah Dasar (SD) yang memerlukan gambar pada pilihan jawaban (contoh: bangun ruang, jenis daun, pecahan kue, peta wilayah, atau rambu lalu lintas):
                </p>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li>
                    <strong>Pilih Tipe Soal:</strong> Pilih <strong>Pilihan Ganda</strong> atau <strong>Pilihan Ganda Kompleks</strong>.
                  </li>
                  <li>
                    <strong>Tombol "Upload Gambar" per Opsi:</strong> Di setiap baris opsi (A, B, C, dan D), tersedia tombol <strong>"Upload Gambar"</strong> dan tombol <strong>"URL"</strong>.
                  </li>
                  <li>
                    <strong>Pilih File Gambar Opsi:</strong> Klik <strong>"Upload Gambar"</strong> pada baris Opsi A untuk memasukkan gambar opsi A. Lakukan hal yang sama untuk Opsi B, C, dan D.
                  </li>
                  <li>
                    <strong>Kombinasi Teks & Gambar:</strong> Anda dapat mengisi teks penjelasan (contoh: "Segitiga Sama Sisi" atau "Pilihan A") atau membiarkannya kosong jika opsi cukup menampilkan gambar saja.
                  </li>
                  <li>
                    <strong>Menentukan Kunci Jawaban:</strong> Tetap pilih radio button (atau centang checkbox untuk PG Kompleks) pada opsi bergambar yang merupakan jawaban yang benar.
                  </li>
                  <li>
                    <strong>Tampilan Otomatis di Layar Ujian Siswa:</strong> Sistem otomatis mengubah tata letak opsi menjadi <strong>Grid Kartu Bergambar (2 kolom)</strong> yang rapi, dan siswa dapat menekan tombol <strong>"Perbesar Opsi"</strong> untuk melihat rincian gambar secara penuh.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#5BA5D5]" /> D. Membuat Paket Ujian Satuan
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li>Buka menu <strong>Jadwal & Paket Ujian</strong> &gt; klik <strong>Buat Jadwal Baru</strong>.</li>
                  <li>Ketikkan nama ujian (misal: "PAS Semester Ganjil - IPAS Kelas VI").</li>
                  <li>Tentukan mata pelajaran, alokasi durasi pengerjaan (misal: 60 menit), serta token ujian akses (misal: <code>XAV6A</code>). Anda dapat mengacak token baru dengan tombol putar.</li>
                  <li>Centang butir-butir soal dari Bank Soal yang ingin diujikan dalam paket ini.</li>
                  <li>Pilih status <strong>Aktif (Dapat Dikerjakan)</strong> dan simpan. Berikan token kepada pengawas ruang sebelum ujian dimulai.</li>
                </ol>
              </div>

              {/* Panduan Unduh & Unggah Template Jadwal Massal */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> E. Unduh Template & Unggah Jadwal Massal (Excel XML .xml)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Untuk mempercepat penjadwalan ujian seluruh mata pelajaran dan rombel kelas tanpa perlu input manual satu per satu:
                </p>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <li>
                    <strong>Unduh Template Excel XML (.xml):</strong> Di menu <strong>Jadwal & Paket Ujian</strong>, klik tombol <strong>"Unduh Template (Excel XML)"</strong> di kanan atas. File template resmi <code>Template_Daftar_Jadwal_Ujian_SD_Xaverius_A1.xml</code> (Excel XML Spreadsheet) akan otomatis terunduh.
                  </li>
                  <li>
                    <strong>Buka Langsung di Microsoft Excel:</strong> Buka file <code>.xml</code> tersebut di Excel. File XML Spreadsheet ini langsung terbuka rapi dengan 2 sheet:
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Sheet 1 (Daftar_Jadwal):</strong> Lembar kerja utama yang sudah dilengkapi kolom nama ujian, mata pelajaran, rombel kelas, jam mulai/selesai, durasi, token akses, dan status pelaksanaan.</li>
                      <li><strong>Sheet 2 (Petunjuk_Referensi):</strong> Lembar referensi lengkap yang memuat daftar nama & kode mata pelajaran resmi serta daftar rombel kelas yang terdaftar di SD Xaverius A1.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Isi Jadwal Ujian Sekolah:</strong> Ketikkan baris demi baris jadwal ujian. Kolom token bisa diisi kode unik atau dikosongkan agar sistem menghasilkan token acak otomatis.
                  </li>
                  <li>
                    <strong>Simpan & Unggah Kembali:</strong> Simpan file (format <code>.xml</code> atau <code>.xlsx</code>), lalu di aplikasi klik tombol <strong>"Unggah & Impor Jadwal"</strong> dan pilih file template Anda.
                  </li>
                  <li>
                    <strong>Pratinjau & Jalankan:</strong> Sistem secara otomatis membaca seluruh baris data dari lembar Excel XML, mencocokkan mata pelajaran & kelas, serta menautkannya dengan bank butir soal. Klik <strong>"Simpan & Jalankan Semua Jadwal"</strong> agar ujian langsung aktif dan siap dikerjakan siswa.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> F. Melihat Nilai & Analisis Hasil
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Buka menu <strong>Nilai & Hasil Ujian</strong>. Guru dapat melihat rekapitulasi nilai akhir siswa secara instan karena sistem melakukan <em>auto-grading</em> otomatis di sisi server begitu siswa menyelesaikan ujian.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= 3. PETUNJUK PESERTA SISWA ======================= */}
        {activeRoleTab === 'siswa' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-sky-100 text-sky-900 border border-sky-200">
                Hak Akses: PESERTA SISWA
              </span>
              <h3 className="text-xl font-black text-[#071D49] mt-2">
                Panduan Ujian CBT untuk Siswa SD Xaverius A1 Ambon
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Petunjuk langkah demi langkah bagi siswa dalam mengikuti ujian berbasis komputer dengan aman, tenang, dan lancar.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#D4AF37]" /> Langkah 1: Masuk Akun & Masukkan Token
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li>Login menggunakan <strong>username</strong> dan <strong>password</strong> yang telah diberikan oleh wali kelas. Siswa tidak perlu membuat email pribadi.</li>
                  <li>Buka menu <strong>Ruang Ujian Siswa (CBT)</strong> di menu sebelah kiri.</li>
                  <li>Pilih paket ujian yang sedang berlangsung (misal: PAS IPAS Kelas VI).</li>
                  <li>Ketikkan <strong>Token Ujian</strong> yang dibacakan/dituliskan oleh Bapak/Ibu Pengawas di papan tulis (contoh: <code>XAV6A</code>), lalu klik <strong>Mulai Mengerjakan Ujian</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5BA5D5]" /> Langkah 2: Menjawab Soal & Fitur Lembar Ujian
                </h4>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li><strong>Penghitung Waktu (Timer):</strong> Di pojok kanan atas terdapat jam hitung mundur. Perhatikan sisa waktu pengerjaan Anda.</li>
                  <li><strong>Penyimpanan Otomatis (Autosave):</strong> Setiap kali Anda memilih jawaban, sistem secara otomatis menyimpannya ke server. Anda tidak perlu khawatir jawaban hilang.</li>
                  <li><strong>Tombol Ragu-ragu:</strong> Jika belum yakin dengan jawaban pada nomor tertentu, centang kotak <em>Ragu-ragu</em>. Nomor pada lembar navigasi akan berubah menjadi warna kuning.</li>
                  <li><strong>Navigasi Soal:</strong> Klik nomor pada kotak navigasi di sisi kanan untuk berpindah ke nomor soal yang Anda inginkan secara cepat.
                    <span className="block mt-1 text-[11px] font-semibold text-slate-500">
                      Hijau = Sudah Dijawab | Kuning = Ragu-ragu | Abu-abu = Belum Dijawab.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-2">
                <h4 className="text-sm font-black text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> PERINGATAN PENTING: Anti-Kecurangan (Proctoring)
                </h4>
                <p className="text-xs text-red-800 leading-relaxed">
                  Selama ujian berlangsung, <strong>DILARANG KERAS</strong> berpindah tab, membuka jendela aplikasi lain, atau meminimalkan browser. Setiap perpindahan layar akan terdeteksi otomatis oleh sistem dan dilaporkan langsung ke layar komputer Pengawas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Langkah 3: Mengumpulkan Ujian & Melihat Hasil
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Setelah memastikan seluruh soal dijawab dan diperiksa ulang, klik tombol <strong>Selesai Ujian</strong> / <strong>Kumpulkan Ujian</strong> pada nomor terakhir. Konfirmasi dengan memilih <em>"Ya, Kumpulkan Sekarang"</em>. Nilai hasil ujian Anda akan langsung muncul di layar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= 4. PETUNJUK PENGAWAS ======================= */}
        {activeRoleTab === 'pengawas' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Hak Akses: PENGAWAS UJIAN (PROCTOR)
              </span>
              <h3 className="text-xl font-black text-[#071D49] mt-2">
                Panduan Pengawasan Ujian Real-Time (Proctor Room)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pengawas bertugas mendampingi jalannya sesi ujian di kelas, membagikan token akses, memantau status pengerjaan siswa, dan menindaklanjuti indikasi pelanggaran.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#D4AF37]" /> A. Persiapan Sebelum Ujian Dimulai
                </h4>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li>Login ke sistem dengan akun pengawas (misal: <code>pengawas_stefanus</code>).</li>
                  <li>Buka menu <strong>Pengawasan Ujian (Proctor)</strong> di sidebar kiri.</li>
                  <li>Pilih paket ujian yang akan berlangsung di ruang kelas Anda.</li>
                  <li>Catat <strong>Token Ujian</strong> yang tertera di bagian atas dan tuliskan di papan tulis kelas untuk dimasukkan oleh seluruh siswa.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> B. Memantau Aktivitas Layar & Status Peserta
                </h4>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <li><strong>Status Peserta:</strong> Tabel monitoring memperlihatkan siswa yang sedang <em>Mengerjakan</em> (badge biru berkedip), <em>Selesai</em> (badge hijau), atau <em>Terkunci</em> (badge merah).</li>
                  <li><strong>Deteksi Pelanggaran:</strong> Kolom "Pelanggaran" menampilkan berapa kali siswa berpindah tab atau meminimalkan browser. Kolom di sisi kanan menampilkan rincian waktu (*timestamp*) dan jenis aktivitas mencurigakan secara langsung (*real-time*).</li>
                  <li><strong>Buka Kunci Sesi:</strong> Jika sesi ujian siswa sempat terhenti atau terkunci karena masalah teknis/jaringan, Pengawas dapat mengklik tombol <strong>Buka Kunci</strong> pada baris siswa terkait agar siswa dapat melanjutkan ujian kembali.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-black text-[#071D49] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> C. Penutupan Sesi Ujian
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Pastikan seluruh peserta telah berstatus <strong>Selesai</strong> pada tabel pengawas sebelum mengizinkan siswa meninggalkan ruang ujian. Pengawas dapat mengunduh atau mencetak rekapitulasi kehadiran dan status ujian untuk diserahkan ke Panitia Ujian Sekolah.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= 5. BANTUAN & FAQ ======================= */}
        {activeRoleTab === 'troubleshoot' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-200">
                Pusat Bantuan Teknis
              </span>
              <h3 className="text-xl font-black text-[#071D49] mt-2">
                Pertanyaan yang Sering Diajukan (FAQ) & Solusi Teknis
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-xs text-[#071D49] mb-1">
                  1. Bagaimana jika siswa atau guru lupa password akunnya?
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hubungi Administrator sekolah. Admin dapat membuka menu <em>Manajemen Akun & Role</em>, mencari username yang bersangkutan, dan mengklik tombol <em>Reset Password</em> untuk memberikan password sementara baru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-xs text-[#071D49] mb-1">
                  2. Apakah siswa perlu akun Google pribadi untuk masuk ke sistem?
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Tidak perlu.</strong> Sistem Xaverius Exam menggunakan akun berbasis username sekolah (contoh: <code>siswa_albert</code>) dengan pemetaan identitas aman di server Firebase untuk melindungi privasi siswa SD.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-xs text-[#071D49] mb-1">
                  3. Apa yang terjadi jika komputer siswa tiba-tiba mati atau jaringan terputus?
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jawaban yang telah dipilih siswa tersimpan secara berkala di server Cloud Firestore. Begitu komputer dinyalakan kembali, siswa cukup login kembali dengan akun yang sama dan memilih ujian; sesi serta jawaban terakhir akan otomatis dipulihkan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-xs text-[#071D49] mb-1">
                  4. Kontak Bantuan Sekolah SD Xaverius A1 Ambon
                </h5>
                <p className="text-xs text-slate-600">
                  Alamat: Jl. Pattimura No. 1, Kota Ambon, Maluku<br />
                  Email: <strong>sdxaveriusa1ambon@gmail.com</strong> | Telp: (0911) 352421
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
