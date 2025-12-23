import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Lesson, LessonCredits, LessonStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  lessons: Lesson[];
  credits: LessonCredits[];
  isLoading: boolean;
  getInstructors: () => User[];
  getStudents: () => User[];
  getUserById: (id: string) => User | undefined;
  getLessonsForUser: (userId: string, role: string) => Lesson[];
  getCreditsForStudent: (studentId: string) => number;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  addLesson: (lesson: Omit<Lesson, 'id' | 'created_at'>) => Promise<boolean>;
  updateLessonStatus: (lessonId: string, status: LessonStatus) => Promise<boolean>;
  cancelLesson: (lessonId: string, refundCredits: boolean) => Promise<boolean>;
  updateCredits: (studentId: string, totalCredits: number) => Promise<boolean>;
  resetUserPincode: (userId: string, newPincode: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [credits, setCredits] = useState<LessonCredits[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch users for the same tenant
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id);

      if (usersError) throw usersError;

      // Fetch lessons for the same tenant
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch credits for the same tenant
      const { data: creditsData, error: creditsError } = await supabase
        .from('lesson_credits')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id);

      if (creditsError) throw creditsError;

      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        tenant_id: u.tenant_id,
        username: u.username,
        pincode: u.pincode,
        role: u.role as User['role'],
        name: u.name,
        created_at: u.created_at,
      }));

      const mappedLessons: Lesson[] = (lessonsData || []).map(l => ({
        id: l.id,
        tenant_id: l.tenant_id,
        instructor_id: l.instructor_id,
        student_id: l.student_id,
        date: l.date,
        start_time: l.start_time,
        duration: l.duration,
        status: l.status as LessonStatus,
        remarks: l.remarks,
        created_at: l.created_at,
      }));

      const mappedCredits: LessonCredits[] = (creditsData || []).map(c => ({
        id: c.id,
        tenant_id: c.tenant_id,
        student_id: c.student_id,
        total_credits: c.total_credits,
        used_credits: c.used_credits,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));

      setUsers(mappedUsers);
      setLessons(mappedLessons);
      setCredits(mappedCredits);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!credit) return 0;
    return credit.total_credits - credit.used_credits;
  };

  const addUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          tenant_id: user.tenant_id,
          username: user.username,
          pincode: user.pincode,
          role: user.role,
          name: user.name,
        })
        .select()
        .single();

      if (error) throw error;

      // If student, create credits
      if (user.role === 'student' && data) {
        await supabase
          .from('lesson_credits')
          .insert({
            tenant_id: user.tenant_id,
            student_id: data.id,
            total_credits: 10,
            used_credits: 0,
          });
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          pincode: updates.pincode,
          name: updates.name,
          role: updates.role,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const addLesson = async (lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lessons')
        .insert({
          tenant_id: lesson.tenant_id,
          instructor_id: lesson.instructor_id,
          student_id: lesson.student_id,
          date: lesson.date,
          start_time: lesson.start_time,
          duration: lesson.duration,
          status: lesson.status,
          remarks: lesson.remarks,
        });

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding lesson:', error);
      return false;
    }
  };

  const updateLessonStatus = async (lessonId: string, status: LessonStatus): Promise<boolean> => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return false;

      // Update lesson status
      const { error } = await supabase
        .from('lessons')
        .update({ status })
        .eq('id', lessonId);

      if (error) throw error;

      // If accepted, increment used_credits
      if (status === 'accepted' && lesson.status === 'pending') {
        const studentCredit = credits.find(c => c.student_id === lesson.student_id);
        if (studentCredit) {
          await supabase
            .from('lesson_credits')
            .update({ used_credits: studentCredit.used_credits + 1 })
            .eq('student_id', lesson.student_id);
        }
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating lesson status:', error);
      return false;
    }
  };

  const updateCredits = async (studentId: string, totalCredits: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lesson_credits')
        .update({ total_credits: totalCredits })
        .eq('student_id', studentId);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating credits:', error);
      return false;
    }
  };

  const cancelLesson = async (lessonId: string, refundCredits: boolean): Promise<boolean> => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return false;

      // Update lesson status to cancelled
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', lessonId);

      if (error) throw error;

      // Refund credits if the lesson was accepted and refund is requested
      if (refundCredits && lesson.status === 'accepted') {
        const studentCredit = credits.find(c => c.student_id === lesson.student_id);
        if (studentCredit && studentCredit.used_credits > 0) {
          await supabase
            .from('lesson_credits')
            .update({ used_credits: studentCredit.used_credits - 1 })
            .eq('student_id', lesson.student_id);
        }
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      return false;
    }
  };

  const resetUserPincode = async (userId: string, newPincode: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ pincode: newPincode })
        .eq('id', userId);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error resetting pincode:', error);
      return false;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        lessons,
        credits,
        isLoading,
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
        cancelLesson,
        updateCredits,
        resetUserPincode,
        refreshData,
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
