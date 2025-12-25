import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Lesson, LessonCredits, LessonStatus, Vehicle } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { sendLessonNotification } from '@/utils/notifications';
import { sendPushNotification } from '@/utils/pushNotifications';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface DataContextType {
  users: User[];
  lessons: Lesson[];
  credits: LessonCredits[];
  vehicles: Vehicle[];
  isLoading: boolean;
  getInstructors: () => User[];
  getStudents: () => User[];
  getUserById: (id: string) => User | undefined;
  getLessonsForUser: (userId: string, role: string) => Lesson[];
  getCreditsForStudent: (studentId: string) => number;
  getStudentsWithLowCredits: () => { student: User; credits: number }[];
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  addLesson: (lesson: Omit<Lesson, 'id' | 'created_at'>) => Promise<boolean>;
  updateLessonStatus: (lessonId: string, status: LessonStatus) => Promise<boolean>;
  cancelLesson: (lessonId: string, refundCredits: boolean) => Promise<boolean>;
  updateCredits: (studentId: string, totalCredits: number) => Promise<boolean>;
  resetUserPincode: (userId: string, newPincode: string) => Promise<boolean>;
  // Vehicle functions
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [credits, setCredits] = useState<LessonCredits[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

      // Fetch vehicles for the same tenant
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id);

      if (vehiclesError) throw vehiclesError;

      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        tenant_id: u.tenant_id,
        username: u.username,
        pincode: u.pincode,
        role: u.role as User['role'],
        name: u.name,
        avatar_url: u.avatar_url,
        email: u.email,
        phone: u.phone,
        address: u.address,
        created_at: u.created_at,
      }));

      // Check for lessons that should be auto-completed (past accepted lessons)
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const lessonsToComplete: string[] = [];
      
      const mappedLessons: Lesson[] = (lessonsData || []).map(l => {
        let status = l.status as LessonStatus;
        
        // Auto-complete logic: if accepted and lesson has ended
        if (status === 'accepted') {
          const lessonDate = l.date;
          const [hours, minutes] = l.start_time.split(':').map(Number);
          const endMinutes = hours * 60 + minutes + l.duration;
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

          if (lessonDate < currentDate || (lessonDate === currentDate && endTime <= currentTime)) {
            status = 'completed';
            lessonsToComplete.push(l.id);
          }
        }

        return {
          id: l.id,
          tenant_id: l.tenant_id,
          instructor_id: l.instructor_id,
          student_id: l.student_id,
          date: l.date,
          start_time: l.start_time,
          duration: l.duration,
          status,
          remarks: l.remarks,
          created_at: l.created_at,
        };
      });

      // Update lessons in database that should be completed (fire and forget)
      if (lessonsToComplete.length > 0) {
        (async () => {
          try {
            await supabase
              .from('lessons')
              .update({ status: 'completed' })
              .in('id', lessonsToComplete);
            console.log(`Auto-completed ${lessonsToComplete.length} lessons`);
          } catch (err) {
            console.error('Error auto-completing lessons:', err);
          }
        })();
      }

      const mappedCredits: LessonCredits[] = (creditsData || []).map(c => ({
        id: c.id,
        tenant_id: c.tenant_id,
        student_id: c.student_id,
        total_credits: c.total_credits,
        used_credits: c.used_credits,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));

      const mappedVehicles: Vehicle[] = (vehiclesData || []).map(v => ({
        id: v.id,
        tenant_id: v.tenant_id,
        brand: v.brand,
        model: v.model,
        license_plate: v.license_plate,
        instructor_id: v.instructor_id,
        created_at: v.created_at,
        updated_at: v.updated_at,
      }));

      setUsers(mappedUsers);
      setLessons(mappedLessons);
      setCredits(mappedCredits);
      setVehicles(mappedVehicles);
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

  // Get students with low credits (≤3)
  const getStudentsWithLowCredits = () => {
    const studentsList = users.filter(u => u.role === 'student');
    return studentsList
      .map(student => ({
        student,
        credits: getCreditsForStudent(student.id)
      }))
      .filter(item => item.credits <= 3)
      .sort((a, b) => a.credits - b.credits);
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
      const updateData: Record<string, unknown> = {};
      if (updates.username !== undefined) updateData.username = updates.username;
      if (updates.pincode !== undefined) updateData.pincode = updates.pincode;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;

      const { error } = await supabase
        .from('users')
        .update(updateData)
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

      // Send notifications for new lesson
      const instructor = users.find(u => u.id === lesson.instructor_id);
      const student = users.find(u => u.id === lesson.student_id);
      if (instructor && student) {
        const formattedDate = format(new Date(lesson.date), 'd MMMM', { locale: nl });
        const formattedTime = lesson.start_time.slice(0, 5);
        
        // Local browser notification
        sendLessonNotification('planned', student.name, instructor.name, formattedDate, formattedTime);
        
        // Push notification to student
        sendPushNotification(
          [lesson.student_id],
          '📅 Nieuwe les gepland',
          `Les met ${instructor.name} op ${formattedDate} om ${formattedTime}`,
          lesson.tenant_id
        );
      }

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

      const instructor = users.find(u => u.id === lesson.instructor_id);
      const student = users.find(u => u.id === lesson.student_id);
      const formattedDate = format(new Date(lesson.date), 'd MMMM', { locale: nl });
      const formattedTime = lesson.start_time.slice(0, 5);

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

      // Send notifications based on status change
      if (instructor && student) {
        if (status === 'accepted') {
          // Local browser notification
          sendLessonNotification('accepted', student.name, instructor.name, formattedDate, formattedTime);
          // Push to instructor that student accepted
          sendPushNotification(
            [lesson.instructor_id],
            '✅ Les geaccepteerd',
            `${student.name} heeft de les op ${formattedDate} om ${formattedTime} geaccepteerd`,
            lesson.tenant_id
          );
        } else if (status === 'cancelled' && lesson.status === 'pending') {
          // Refused (student weigert pending les)
          sendLessonNotification('refused', student.name, instructor.name, formattedDate, formattedTime);
          // Push to instructor that student refused
          sendPushNotification(
            [lesson.instructor_id],
            '🚫 Les geweigerd',
            `${student.name} heeft de les op ${formattedDate} om ${formattedTime} geweigerd`,
            lesson.tenant_id
          );
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

      // Send cancellation notifications
      const instructor = users.find(u => u.id === lesson.instructor_id);
      const student = users.find(u => u.id === lesson.student_id);
      if (instructor && student) {
        const formattedDate = format(new Date(lesson.date), 'd MMMM', { locale: nl });
        const formattedTime = lesson.start_time.slice(0, 5);
        
        // Local browser notification
        sendLessonNotification('cancelled', student.name, instructor.name, formattedDate, formattedTime);
        
        // Push to both instructor and student
        sendPushNotification(
          [lesson.instructor_id, lesson.student_id],
          '❌ Les geannuleerd',
          `De les op ${formattedDate} om ${formattedTime} is geannuleerd`,
          lesson.tenant_id
        );
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

  // Vehicle functions
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          tenant_id: vehicle.tenant_id,
          brand: vehicle.brand,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          instructor_id: vehicle.instructor_id,
        });

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return false;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          brand: updates.brand,
          model: updates.model,
          license_plate: updates.license_plate,
          instructor_id: updates.instructor_id,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return false;
    }
  };

  const deleteVehicle = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        users,
        lessons,
        credits,
        vehicles,
        isLoading,
        getInstructors,
        getStudents,
        getUserById,
        getLessonsForUser,
        getCreditsForStudent,
        getStudentsWithLowCredits,
        addUser,
        updateUser,
        deleteUser,
        addLesson,
        updateLessonStatus,
        cancelLesson,
        updateCredits,
        resetUserPincode,
        addVehicle,
        updateVehicle,
        deleteVehicle,
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
