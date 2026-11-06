/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AuditLog } from '../types';
import { ShieldAlert, Search, Filter, Clock, RotateCcw, ShieldCheck } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.auditLogs.getAll();
      setLogs(res.auditLogs || []);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchQuery =
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAction = selectedAction === 'all' || l.action.includes(selectedAction);
    return matchQuery && matchAction;
  });

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (action.includes('LOGOUT')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (action.includes('BOOTSTRAP')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (action.includes('CHANGE_ROLE') || action.includes('RESET_PASSWORD'))
      return 'bg-amber-100 text-amber-800 border-amber-300';
    if (action.includes('ACCESS_DENIED')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#D4AF37]" /> Log Audit Keamanan Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jejak rekaman aktivitas keamanan immutable di sisi backend SD Xaverius A1 Ambon.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh Audit Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelaku, aksi, atau detail..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071D49]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          >
            <option value="all">Semua Jenis Aksi</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE_USER">Pembuatan Akun</option>
            <option value="CHANGE_ROLE">Perubahan Role</option>
            <option value="RESET_PASSWORD">Reset Password</option>
            <option value="STUDENT">Data Siswa</option>
            <option value="TEACHER">Data Guru</option>
            <option value="CLASS">Data Kelas</option>
            <option value="EXAM">Jadwal / Ujian</option>
            <option value="QUESTION">Bank Soal</option>
          </select>
        </div>

        <span className="ml-auto text-slate-500 font-medium">
          Total Log Tercatat: {filteredLogs.length} kejadian
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu (WITA/WIT)</th>
                <th className="py-3 px-4">Pelaku (Actor)</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Aksi Keamanan</th>
                <th className="py-3 px-4">Target Modul</th>
                <th className="py-3 px-4">Detail Kejadian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#071D49]">{log.actorName}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-600">{log.target}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
