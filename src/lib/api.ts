/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Student, Teacher, SchoolClass, Subject, SchoolSettings, QuestionBankItem, Exam, ExamSession, Result, AuditLog, ProctorAssignment } from '../types';

const TOKEN_KEY = 'xaverius_token';
const USER_KEY = 'xaverius_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): User | null => {
    const val = localStorage.getItem(USER_KEY);
    return val ? JSON.parse(val) : null;
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = storage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada sistem.');
  }

  return data;
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const data = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (data.token) storage.setToken(data.token);
      if (data.user) storage.setUser(data.user);
      return data;
    },
    logout: async () => {
      try {
        await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      } finally {
        storage.clear();
      }
    },
    getMe: async () => {
      return fetchWithAuth('/api/auth/me');
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      return fetchWithAuth('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  },

  admin: {
    getBootstrapStatus: async () => {
      const res = await fetch('/api/admin/bootstrap-status');
      return res.json();
    },
    bootstrapAdmin: async (payload: { username: string; password: string; fullName: string; email: string }) => {
      return fetchWithAuth('/api/admin/bootstrap', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getUsers: async (): Promise<{ success: boolean; users: User[] }> => {
      return fetchWithAuth('/api/admin/users');
    },
    createUser: async (user: any) => {
      return fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },
    updateUser: async (uid: string, updates: any) => {
      return fetchWithAuth(`/api/admin/users/${uid}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    resetPassword: async (uid: string, newPassword: string) => {
      return fetchWithAuth(`/api/admin/users/${uid}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });
    },
    bulkImportUsers: async (users: any[]) => {
      return fetchWithAuth('/api/admin/users/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ users }),
      });
    },
  },

  master: {
    getAll: async (): Promise<{
      students: Student[];
      teachers: Teacher[];
      classes: SchoolClass[];
      subjects: Subject[];
      schoolSettings: SchoolSettings;
    }> => {
      return fetchWithAuth('/api/master/all');
    },
    saveStudent: async (student: Partial<Student>, id?: string) => {
      const url = id ? `/api/master/students/${id}` : '/api/master/students';
      const method = id ? 'PUT' : 'POST';
      return fetchWithAuth(url, { method, body: JSON.stringify(student) });
    },
    saveTeacher: async (teacher: Partial<Teacher>, id?: string) => {
      const url = id ? `/api/master/teachers/${id}` : '/api/master/teachers';
      const method = id ? 'PUT' : 'POST';
      return fetchWithAuth(url, { method, body: JSON.stringify(teacher) });
    },
    saveClass: async (cls: Partial<SchoolClass>, id?: string) => {
      const url = id ? `/api/master/classes/${id}` : '/api/master/classes';
      const method = id ? 'PUT' : 'POST';
      return fetchWithAuth(url, { method, body: JSON.stringify(cls) });
    },
    saveSubject: async (subj: Partial<Subject>, id?: string) => {
      const url = id ? `/api/master/subjects/${id}` : '/api/master/subjects';
      const method = id ? 'PUT' : 'POST';
      return fetchWithAuth(url, { method, body: JSON.stringify(subj) });
    },
    updateSettings: async (settings: Partial<SchoolSettings>) => {
      return fetchWithAuth('/api/master/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
    bulkImportStudents: async (students: any[]) => {
      return fetchWithAuth('/api/master/students/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ students }),
      });
    },
    bulkImportTeachers: async (teachers: any[]) => {
      return fetchWithAuth('/api/master/teachers/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ teachers }),
      });
    },
  },

  questionBanks: {
    getAll: async (): Promise<{ success: boolean; questions: QuestionBankItem[] }> => {
      return fetchWithAuth('/api/question-banks');
    },
    create: async (question: Partial<QuestionBankItem>) => {
      return fetchWithAuth('/api/question-banks', {
        method: 'POST',
        body: JSON.stringify(question),
      });
    },
    update: async (id: string, question: Partial<QuestionBankItem>) => {
      return fetchWithAuth(`/api/question-banks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(question),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/api/question-banks/${id}`, {
        method: 'DELETE',
      });
    },
  },

  exams: {
    getAll: async (): Promise<{ success: boolean; exams: Exam[] }> => {
      return fetchWithAuth('/api/exams');
    },
    create: async (exam: Partial<Exam>) => {
      return fetchWithAuth('/api/exams', {
        method: 'POST',
        body: JSON.stringify(exam),
      });
    },
    update: async (id: string, exam: Partial<Exam>) => {
      return fetchWithAuth(`/api/exams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(exam),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/api/exams/${id}`, {
        method: 'DELETE',
      });
    },
    bulkImport: async (exams: Partial<Exam>[]) => {
      return fetchWithAuth('/api/exams/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ exams }),
      });
    },
    startSession: async (examId: string, token: string) => {
      return fetchWithAuth('/api/exams/start-session', {
        method: 'POST',
        body: JSON.stringify({ examId, token }),
      });
    },
    saveAnswer: async (sessionId: string, questionId: string, answer: any, flagged?: boolean) => {
      return fetchWithAuth('/api/exams/save-answer', {
        method: 'POST',
        body: JSON.stringify({ sessionId, questionId, answer, flagged }),
      });
    },
    submit: async (sessionId: string) => {
      return fetchWithAuth('/api/exams/submit', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
    },
    logEvent: async (sessionId: string, eventType: string, details?: string) => {
      return fetchWithAuth('/api/exams/log-event', {
        method: 'POST',
        body: JSON.stringify({ sessionId, eventType, details }),
      });
    },
  },

  proctor: {
    getSessions: async (examId?: string) => {
      const q = examId ? `?examId=${examId}` : '';
      return fetchWithAuth(`/api/proctor/sessions${q}`);
    },
    unlockSession: async (sessionId: string) => {
      return fetchWithAuth('/api/proctor/unlock-session', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
    },
    getAssignments: async (): Promise<{ success: boolean; assignments: ProctorAssignment[] }> => {
      return fetchWithAuth('/api/proctor/assignments');
    },
    saveAssignment: async (assignment: Partial<ProctorAssignment>) => {
      return fetchWithAuth('/api/proctor/assignments', {
        method: 'POST',
        body: JSON.stringify(assignment),
      });
    },
    bulkImportAssignments: async (assignments: Partial<ProctorAssignment>[]) => {
      return fetchWithAuth('/api/proctor/assignments/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ assignments }),
      });
    },
    deleteAssignment: async (id: string) => {
      return fetchWithAuth(`/api/proctor/assignments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  results: {
    getAll: async (): Promise<{ success: boolean; results: Result[] }> => {
      return fetchWithAuth('/api/results');
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/api/results/${id}`, {
        method: 'DELETE',
      });
    },
  },

  auditLogs: {
    getAll: async (): Promise<{ success: boolean; auditLogs: AuditLog[] }> => {
      return fetchWithAuth('/api/audit-logs');
    },
  },

  testing: {
    runAll: async () => {
      const res = await fetch('/api/test/run-all');
      return res.json();
    },
  },
};
