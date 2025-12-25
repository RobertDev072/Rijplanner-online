import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { GraduationCap, KeyRound, UserPlus, Trash2, X, Check, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const { getStudents, getCreditsForStudent, resetUserPincode, addUser, deleteUser } = useData();
  
  const [resetPincodeUser, setResetPincodeUser] = useState<{ id: string; name: string } | null>(null);
  const [newPincode, setNewPincode] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [filterNoTheory, setFilterNoTheory] = useState(false);

  if (!user || user.role !== 'instructor') return null;

  const allStudents = getStudents();
  const students = filterNoTheory ? allStudents.filter(s => !s.theory_passed) : allStudents;
  const noTheoryCount = allStudents.filter(s => !s.theory_passed).length;

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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || pincode.length !== 4) {
      toast.error('Vul alle velden correct in (pincode = 4 cijfers)');
      return;
    }

    const success = await addUser({
      tenant_id: user.tenant_id,
      username: username.toLowerCase(),
      pincode,
      role: 'student',
      name,
    });

    if (success) {
      toast.success('Leerling toegevoegd!');
      setName('');
      setUsername('');
      setPincode('');
      setShowAddForm(false);
    } else {
      toast.error('Kon leerling niet toevoegen');
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (confirm(`Weet je zeker dat je ${studentName} wilt verwijderen?`)) {
      const success = await deleteUser(studentId);
      if (success) {
        toast.success('Leerling verwijderd');
      } else {
        toast.error('Kon leerling niet verwijderen');
      }
    }
  };

  return (
    <div className="page-container">
      <Header title="Mijn leerlingen" />

      {/* Filter & Add Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setFilterNoTheory(!filterNoTheory)}
          variant={filterNoTheory ? 'default' : 'outline'}
          className="flex-1"
          size="sm"
        >
          <BookOpen className="w-4 h-4" />
          Geen theorie ({noTheoryCount})
        </Button>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'accent'}
          size="sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="glass-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up">
          <div className="space-y-2">
            <label className="text-sm font-medium">Naam</label>
            <Input placeholder="Volledige naam" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Gebruikersnaam</label>
            <Input placeholder="Gebruikersnaam" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pincode (4 cijfers)</label>
            <Input type="text" inputMode="numeric" placeholder="1234" maxLength={4} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} />
          </div>
          <Button type="submit" className="w-full"><Check className="w-4 h-4" />Toevoegen</Button>
        </form>
      )}

      <div className="space-y-3">
        {students.map(student => (
          <div key={student.id} className="glass-card rounded-xl p-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${student.theory_passed ? 'bg-success/10' : 'bg-accent/10'}`}>
                  {student.theory_passed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{student.name}</p>
                    {student.theory_passed && (
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30 px-1.5 py-0">
                        <BookOpen className="w-3 h-3 mr-0.5" />
                        Theorie
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditsBadge credits={getCreditsForStudent(student.id)} size="sm" />
                <Button size="icon" variant="ghost" onClick={() => setResetPincodeUser({ id: student.id, name: student.name })} title="Pincode resetten">
                  <KeyRound className="w-4 h-4 text-warning" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteStudent(student.id, student.name)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
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

      <AlertDialog open={!!resetPincodeUser} onOpenChange={(open) => !open && setResetPincodeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pincode resetten</AlertDialogTitle>
            <AlertDialogDescription>Voer een nieuwe 4-cijferige pincode in voor {resetPincodeUser?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input type="text" inputMode="numeric" placeholder="Nieuwe pincode (4 cijfers)" maxLength={4} value={newPincode} onChange={e => setNewPincode(e.target.value.replace(/\D/g, ''))} className="text-center text-lg tracking-widest" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewPincode('')}>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPincode} disabled={newPincode.length !== 4 || isResetting}>{isResetting ? 'Bezig...' : 'Pincode resetten'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
