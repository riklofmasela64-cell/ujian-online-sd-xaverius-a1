/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  TestTube2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Lock,
  Database,
  Key,
  ShieldAlert,
} from 'lucide-react';

interface TestItem {
  id: number;
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  message: string;
  details?: any;
}

export const TestingView: React.FC = () => {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [running, setRunning] = useState(false);
  const [allPass, setAllPass] = useState(false);
  const [executionTime, setExecutionTime] = useState<string>('');

  const runAllTests = async () => {
    setRunning(true);
    try {
      const startTime = performance.now();
      const res = await api.testing.runAll();
      const endTime = performance.now();

      setTests(res.testResults || []);
      setAllPass(res.allPass || false);
      setExecutionTime(`${(endTime - startTime).toFixed(1)} ms`);
    } catch (e: any) {
      console.error('Test execution failed', e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#071D49] flex items-center gap-2">
              <TestTube2 className="w-5 h-5 text-[#D4AF37]" /> Pusat Pengujian & Verifikasi Keamanan (12 Poin Uji)
            </h2>
            {allPass && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                12/12 PASS
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengujian otomatis mencakup autentikasi 4 role, Firestore rules, isolasi kunci jawaban, dan mitigasi pelanggaran.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={running}
          className="px-5 py-2.5 bg-[#071D49] hover:bg-[#0A2255] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60 shrink-0"
        >
          {running ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>Menjalankan Uji Sistem...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-[#D4AF37]" />
              <span>Jalankan Ulang 12 Pengujian</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Banner */}
      <div
        className={`p-5 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          allPass
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            {allPass ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h3 className="font-black text-sm">
              {allPass
                ? 'Seluruh 12 Skenario Pengujian Berhasil Diverifikasi (PASS)'
                : 'Pengujian Sistem Sedang Berjalan'}
            </h3>
            <p className="text-slate-600 text-[11px] mt-0.5">
              SD Xaverius A1 Ambon • Firebase Authentication, Security Rules, RBAC, dan Database Firestore aman.
            </p>
          </div>
        </div>

        {executionTime && (
          <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
            Waktu Uji: <strong>{executionTime}</strong>
          </div>
        )}
      </div>

      {/* 12 Test Cases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5 hover:border-[#D4AF37] transition-all"
          >
            <div className="mt-0.5 shrink-0">
              {t.status === 'PASS' ? (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-[#071D49]">
                  {t.id}. {t.name}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    t.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{t.message}</p>

              {t.details && (
                <pre className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-500 font-mono overflow-x-auto border border-slate-100 mt-2">
                  {JSON.stringify(t.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
