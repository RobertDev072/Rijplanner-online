import React, { useState, useMemo } from 'react';
import { User } from '@/types';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentSearchProps {
  students: User[];
  selectedStudentId: string;
  onSelect: (studentId: string) => void;
  getCredits: (studentId: string) => number;
}

export function StudentSearch({ students, selectedStudentId, onSelect, getCredits }: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      student =>
        student.name.toLowerCase().includes(query) ||
        student.username.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const showSearch = students.length > 3;

  return (
    <div className="space-y-3">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek leerling..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
        {filteredStudents.map(student => {
          const credits = getCredits(student.id);
          const isSelected = selectedStudentId === student.id;

          return (
            <button
              key={student.id}
              type="button"
              onClick={() => onSelect(student.id)}
              className={cn(
                "glass-card rounded-xl p-4 text-left transition-all duration-200",
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                </div>
                <CreditsBadge credits={credits} size="sm" showLabel={false} />
              </div>
            </button>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Geen leerlingen gevonden
          </div>
        )}
      </div>
    </div>
  );
}
