import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { GraduationCap, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Students() {
  const { user } = useAuth();
  const { getStudents, getCreditsForStudent, resetUserPincode } = useData();
  
  const [resetPincodeUser, setResetPincodeUser] = useState<{ id: string; name: string } | null>(null);
  const [newPincode, setNewPincode] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  if (!user || user.role !== 'instructor') return null;

  const students = getStudents();

  const handleResetPincode = async () => {
    if (!resetPincodeUser || newPincode.length !== 4) {
      toast.error('Pincode moet 4 cijfers zijn');
      return;
    }

    setIsResetting(true);
    try {
      const success = await resetUserPincode(resetPincodeUser.id, newPincode);
      if (success) {
        toast.success(`Pincode van ${resetPincodeUser.name} is gereset`);
        setResetPincodeUser(null);
        setNewPincode('');
      } else {
        toast.error('Kon pincode niet resetten');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="page-container">
      <Header title="Mijn leerlingen" />

      <div className="space-y-3">
        {students.map(student => (
          <div key={student.id} className="glass-card rounded-xl p-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditsBadge credits={getCreditsForStudent(student.id)} size="sm" />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setResetPincodeUser({ id: student.id, name: student.name })}
                  title="Pincode resetten"
                >
                  <KeyRound className="w-4 h-4 text-warning" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="glass-card rounded-xl p-6 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nog geen leerlingen</p>
          </div>
        )}
      </div>

      {/* Reset Pincode Dialog */}
      <AlertDialog open={!!resetPincodeUser} onOpenChange={(open) => !open && setResetPincodeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pincode resetten</AlertDialogTitle>
            <AlertDialogDescription>
              Voer een nieuwe 4-cijferige pincode in voor {resetPincodeUser?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Nieuwe pincode (4 cijfers)"
              maxLength={4}
              value={newPincode}
              onChange={e => setNewPincode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewPincode('')}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPincode}
              disabled={newPincode.length !== 4 || isResetting}
            >
              {isResetting ? 'Bezig...' : 'Pincode resetten'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}