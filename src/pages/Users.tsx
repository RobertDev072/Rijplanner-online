import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { 
  UserPlus, 
  Users as UsersIcon, 
  GraduationCap, 
  Trash2,
  Edit2,
  X,
  Check,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
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

type TabType = 'instructors' | 'students';

export default function Users() {
  const { user } = useAuth();
  const { getInstructors, getStudents, getCreditsForStudent, addUser, deleteUser, updateCredits, resetUserPincode } = useData();
  
  const [activeTab, setActiveTab] = useState<TabType>('instructors');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState('');
  const [resetPincodeUser, setResetPincodeUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [newPincode, setNewPincode] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  const instructors = getInstructors();
  const students = getStudents();
  const currentList = activeTab === 'instructors' ? instructors : students;

  // Check if user can reset pincode for target user
  const canResetPincode = (targetRole: UserRole): boolean => {
    if (user.role === 'superadmin') return true; // Superadmin can reset everyone
    if (user.role === 'admin' && targetRole === 'instructor') return true; // Admin can reset instructor
    if (user.role === 'instructor' && targetRole === 'student') return true; // Instructor can reset student
    return false;
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !username.trim() || pincode.length !== 4) {
      toast.error('Vul alle velden correct in (pincode = 4 cijfers)');
      return;
    }

    addUser({
      tenant_id: user.tenant_id,
      username: username.toLowerCase(),
      pincode,
      role: activeTab === 'instructors' ? 'instructor' : 'student',
      name,
    });

    toast.success(`${activeTab === 'instructors' ? 'Instructeur' : 'Leerling'} toegevoegd!`);
    setName('');
    setUsername('');
    setPincode('');
    setShowAddForm(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Weet je zeker dat je ${userName} wilt verwijderen?`)) {
      deleteUser(userId);
      toast.success('Gebruiker verwijderd');
    }
  };

  const handleUpdateCredits = (studentId: string) => {
    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      toast.error('Ongeldig aantal credits');
      return;
    }
    updateCredits(studentId, credits);
    setEditingCredits(null);
    setNewCredits('');
    toast.success('Credits bijgewerkt');
  };

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
      <Header title="Gebruikers" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'instructors' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('instructors')}
          className="flex-1"
        >
          <UsersIcon className="w-4 h-4" />
          Instructeurs ({instructors.length})
        </Button>
        <Button
          variant={activeTab === 'students' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('students')}
          className="flex-1"
        >
          <GraduationCap className="w-4 h-4" />
          Leerlingen ({students.length})
        </Button>
      </div>

      {/* Add Button */}
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        variant={showAddForm ? 'secondary' : 'accent'}
        className="w-full mb-4"
      >
        {showAddForm ? (
          <>
            <X className="w-4 h-4" />
            Annuleren
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            {activeTab === 'instructors' ? 'Instructeur toevoegen' : 'Leerling toevoegen'}
          </>
        )}
      </Button>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddUser} className="glass-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up">
          <div className="space-y-2">
            <label className="text-sm font-medium">Naam</label>
            <Input
              placeholder="Volledige naam"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Gebruikersnaam</label>
            <Input
              placeholder="Gebruikersnaam"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pincode (4 cijfers)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="1234"
              maxLength={4}
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button type="submit" className="w-full">
            <Check className="w-4 h-4" />
            Toevoegen
          </Button>
        </form>
      )}

      {/* User List */}
      <div className="space-y-3">
        {currentList.map(u => (
          <div key={u.id} className="glass-card rounded-xl p-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{u.name}</p>
                <p className="text-sm text-muted-foreground">@{u.username}</p>
              </div>

              {activeTab === 'students' && (
                <div className="flex items-center gap-2 mr-3">
                  {editingCredits === u.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={newCredits}
                        onChange={e => setNewCredits(e.target.value)}
                        className="w-16 h-8 text-sm"
                        min="0"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleUpdateCredits(u.id)}
                      >
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingCredits(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCredits(u.id);
                        setNewCredits(getCreditsForStudent(u.id).toString());
                      }}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <CreditsBadge credits={getCreditsForStudent(u.id)} size="sm" />
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}

              {/* Reset Pincode Button */}
              {canResetPincode(u.role) && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setResetPincodeUser({ id: u.id, name: u.name, role: u.role })}
                  title="Pincode resetten"
                >
                  <KeyRound className="w-4 h-4 text-warning" />
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteUser(u.id, u.name)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        {currentList.length === 0 && (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-muted-foreground">
              Nog geen {activeTab === 'instructors' ? 'instructeurs' : 'leerlingen'}
            </p>
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