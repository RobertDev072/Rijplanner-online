import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Lesson, LessonCredits, LessonStatus } from '@/types';

// Mock data
const MOCK_USERS: User[] = [
  {
    id: '1',
    tenant_id: 'tenant-1',
    username: 'admin',
    pincode: '1234',
    role: 'admin',
    name: 'Jan de Vries',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: 'tenant-1',
    username: 'instructeur1',
    pincode: '5678',
    role: 'instructor',
    name: 'Peter Jansen',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    tenant_id: 'tenant-1',
    username: 'leerling1',
    pincode: '9012',
    role: 'student',
    name: 'Lisa Bakker',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    tenant_id: 'tenant-1',
    username: 'leerling2',
    pincode: '3456',
    role: 'student',
    name: 'Mark Visser',
    created_at: new Date().toISOString(),
  },
];

const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    tenant_id: 'tenant-1',
    instructor_id: '2',
    student_id: '3',
    date: '2024-12-24',
    start_time: '10:00',
    duration_minutes: 60,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'lesson-2',
    tenant_id: 'tenant-1',
    instructor_id: '2',
    student_id: '4',
    date: '2024-12-24',
    start_time: '14:00',
    duration_minutes: 90,
    status: 'accepted',
    created_at: new Date().toISOString(),
  },
  {
    id: 'lesson-3',
    tenant_id: 'tenant-1',
    instructor_id: '2',
    student_id: '3',
    date: '2024-12-26',
    start_time: '09:00',
    duration_minutes: 60,
    status: 'accepted',
    created_at: new Date().toISOString(),
  },
];

const MOCK_CREDITS: LessonCredits[] = [
  { id: 'credit-1', tenant_id: 'tenant-1', student_id: '3', credits: 8, updated_at: new Date().toISOString() },
  { id: 'credit-2', tenant_id: 'tenant-1', student_id: '4', credits: 3, updated_at: new Date().toISOString() },
];

interface DataContextType {
  users: User[];
  lessons: Lesson[];
  credits: LessonCredits[];
  getInstructors: () => User[];
  getStudents: () => User[];
  getUserById: (id: string) => User | undefined;
  getLessonsForUser: (userId: string, role: string) => Lesson[];
  getCreditsForStudent: (studentId: string) => number;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addLesson: (lesson: Omit<Lesson, 'id' | 'created_at'>) => void;
  updateLessonStatus: (lessonId: string, status: LessonStatus) => void;
  updateCredits: (studentId: string, credits: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [credits, setCredits] = useState<LessonCredits[]>(MOCK_CREDITS);

  const getInstructors = () => users.filter(u => u.role === 'instructor');
  const getStudents = () => users.filter(u => u.role === 'student');
  const getUserById = (id: string) => users.find(u => u.id === id);

  const getLessonsForUser = (userId: string, role: string) => {
    if (role === 'admin') return lessons;
    if (role === 'instructor') return lessons.filter(l => l.instructor_id === userId);
    return lessons.filter(l => l.student_id === userId);
  };

  const getCreditsForStudent = (studentId: string) => {
    const credit = credits.find(c => c.student_id === studentId);
    return credit?.credits ?? 0;
  };

  const addUser = (user: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);

    // Als het een student is, maak ook credits aan
    if (user.role === 'student') {
      const newCredit: LessonCredits = {
        id: `credit-${Date.now()}`,
        tenant_id: user.tenant_id,
        student_id: newUser.id,
        credits: 10,
        updated_at: new Date().toISOString(),
      };
      setCredits(prev => [...prev, newCredit]);
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setCredits(prev => prev.filter(c => c.student_id !== id));
  };

  const addLesson = (lesson: Omit<Lesson, 'id' | 'created_at'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const updateLessonStatus = (lessonId: string, status: LessonStatus) => {
    setLessons(prev =>
      prev.map(l => {
        if (l.id === lessonId) {
          // Als geaccepteerd, trek credits af
          if (status === 'accepted' && l.status === 'pending') {
            const currentCredits = getCreditsForStudent(l.student_id);
            if (currentCredits > 0) {
              updateCredits(l.student_id, currentCredits - 1);
            }
          }
          return { ...l, status };
        }
        return l;
      })
    );
  };

  const updateCredits = (studentId: string, newCredits: number) => {
    setCredits(prev =>
      prev.map(c =>
        c.student_id === studentId
          ? { ...c, credits: newCredits, updated_at: new Date().toISOString() }
          : c
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        users,
        lessons,
        credits,
        getInstructors,
        getStudents,
        getUserById,
        getLessonsForUser,
        getCreditsForStudent,
        addUser,
        updateUser,
        deleteUser,
        addLesson,
        updateLessonStatus,
        updateCredits,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
