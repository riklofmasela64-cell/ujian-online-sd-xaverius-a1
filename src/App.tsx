/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MasterDataView } from './views/MasterDataView';
import { QuestionBankView } from './views/QuestionBankView';
import { ExamManagementView } from './views/ExamManagementView';
import { StudentExamView } from './views/StudentExamView';
import { ProctorView } from './views/ProctorView';
import { ResultsView } from './views/ResultsView';
import { UserManagementView } from './views/UserManagementView';
import { AuditLogView } from './views/AuditLogView';
import { TestingView } from './views/TestingView';
import { GuideView } from './views/GuideView';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { X, TestTube2 } from 'lucide-react';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Auto-route to student exam if URL parameter or student role is present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasExam = params.get('exam') || params.get('examId') || params.get('tab') === 'student-exam';
    if (hasExam || user?.role === 'siswa') {
      setActiveTab('student-exam');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#071D49] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-widest uppercase text-slate-300">
            Memuat Sistem Xaverius Exam...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginView onOpenTestModal={() => setIsTestModalOpen(true)} />

        {/* Global Testing Modal in Login Screen */}
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
              <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube2 className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-bold text-sm">Hasil Uji Verifikasi Keamanan (12 Skenario)</h3>
                </div>
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <TestingView />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'student-exam' && <StudentExamView />}
          {activeTab === 'proctor' && <ProctorView />}
          {activeTab === 'question-banks' && <QuestionBankView />}
          {activeTab === 'exams' && <ExamManagementView />}
          {activeTab === 'master-data' && <MasterDataView />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'audit-logs' && <AuditLogView />}
          {activeTab === 'testing' && <TestingView />}
          {activeTab === 'guide' && <GuideView />}
        </main>
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-[#071D49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Hasil Uji Verifikasi Keamanan (12 Skenario)</h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <TestingView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
