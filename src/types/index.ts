/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'guru' | 'siswa' | 'pengawas';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  uid: string;
  username: string;
  fullName: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  token?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  studentId: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  classId: string;
  className?: string;
  academicYear: string;
  status: 'active' | 'inactive';
  phone?: string;
  parentName?: string;
}

export interface Teacher {
  teacherId: string;
  fullName: string;
  nip: string;
  email?: string;
  subjectIds: string[];
  assignedClassIds: string[];
  status: 'active' | 'inactive';
}

export interface SchoolClass {
  classId: string;
  className: string;
  grade: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  academicYear: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  studentCount: number;
}

export interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  gradeLevels: string[];
  status: 'active' | 'inactive';
}

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  schoolLogo: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  contactInformation: string;
  headmasterName: string;
  headmasterNip: string;
}

export type QuestionType =
  | 'multiple_choice' // Pilihan Ganda Biasa
  | 'complex_mc'     // Pilihan Ganda Kompleks
  | 'matching'       // Menjodohkan
  | 'true_false'     // Benar / Salah
  | 'essay';         // Isian / Uraian Singkat

export interface QuestionOption {
  id: string;
  text: string;
  image?: string; // Optional image URL or base64 data for option A/B/C/D
  isCorrect?: boolean; // Hidden from students during exam
}

export interface MatchingPair {
  id: string;
  premise: string;
  response: string;
}

export interface QuestionBankItem {
  questionId: string;
  teacherId: string;
  teacherName?: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  gradeLevel: string;
  questionType: QuestionType;
  questionText: string;
  imageReferences?: string[];
  options?: QuestionOption[];
  answerKey?: string | string[]; // Protected
  matchingPairs?: MatchingPair[];
  acceptedAnswers?: string[];
  rubric?: string;
  weight: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName?: string;
  classIds: string[];
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  questionIds: string[];
  totalWeight: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  createdBy: string;
  token: string;
  allowReview?: boolean;
}

export interface ExamSession {
  sessionId: string;
  examId: string;
  examName?: string;
  studentId: string;
  studentName?: string;
  studentNis?: string;
  className?: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'timed_out' | 'blocked';
  remainingSeconds?: number;
  violationCount: number;
  lastActiveAt: string;
}

export interface AnswerItem {
  answerId: string;
  sessionId: string;
  questionId: string;
  answer: any; // string, string[], or Record<string, string>
  savedAt: string;
  flagged?: boolean; // Ragu-ragu
}

export interface ExamLog {
  logId: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  eventType: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'reconnect' | 'start' | 'submit';
  timestamp: string;
  details: string;
}

export interface Result {
  resultId: string;
  sessionId: string;
  examId: string;
  examName?: string;
  studentId: string;
  studentName?: string;
  studentNis?: string;
  className?: string;
  totalScore: number;
  maximumScore: number;
  finalScore: number;
  gradingStatus: 'graded' | 'partial' | 'pending';
  gradedAt: string;
  correctAnswersCount?: number;
  wrongAnswersCount?: number;
}

export interface AuditLog {
  logId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface ProctorAssignment {
  id?: string;
  assignmentId: string;
  proctorName: string;
  nip?: string;
  nipOrCode?: string;
  roomName: string;
  examId?: string;
  examName?: string;
  classIds?: string[];
  targetClasses?: string;
  sessionTime?: string;
  contact?: string;
  contactNumber?: string;
  status?: 'assigned' | 'present' | 'completed';
  notes?: string;
}

