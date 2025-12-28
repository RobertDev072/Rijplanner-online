import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Coins,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Credits() {
  const { user } = useAuth();
  const { getStudents, getCreditsForStudent } = useData();
  const navigate = useNavigate();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'superadmin')) {
    return null;
  }

  const students = getStudents();

  // Students with low credits (< 2)
  const lowCreditStudents = students
    .map(student => ({
      student,
      credits: getCreditsForStudent(student.id)
    }))
    .filter(item => item.credits < 2)
    .sort((a, b) => a.credits - b.credits);

  // Students with high credits (> 30) and no theory
  const highCreditNoTheoryStudents = students
    .map(student => ({
      student,
      credits: getCreditsForStudent(student.id)
    }))
    .filter(item => item.credits > 30 && !item.student.theory_passed)
    .sort((a, b) => b.credits - a.credits);

  // All students sorted by credits
  const allStudentsByCredits = students
    .map(student => ({
      student,
      credits: getCreditsForStudent(student.id)
    }))
    .sort((a, b) => a.credits - b.credits);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCreditBadgeVariant = (credits: number) => {
    if (credits < 2) return 'destructive';
    if (credits <= 5) return 'secondary';
    if (credits > 30) return 'default';
    return 'outline';
  };

  return (
    <MobileLayout title="Credits Overzicht">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card border-destructive/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{lowCreditStudents.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Weinig Credits (&lt;2)</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-warning/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-2xl font-bold text-warning">{highCreditNoTheoryStudents.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Veel Credits, Geen Theorie</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Credits Alert */}
        {lowCreditStudents.length > 0 && (
          <Card className="glass-card border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertCircle className="w-5 h-5" />
                Leerlingen met Weinig Credits
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Deze leerlingen hebben minder dan 2 credits en moeten bijkopen
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowCreditStudents.map(({ student, credits }) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-destructive/20 cursor-pointer hover:bg-background/80 transition-colors"
                  onClick={() => navigate(`/students`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-destructive/30">
                      <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                      <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>@{student.username}</span>
                        {student.theory_passed ? (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Theorie
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                            <XCircle className="w-3 h-3 mr-1" />
                            Geen Theorie
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    <Coins className="w-4 h-4 mr-1" />
                    {credits}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* High Credits No Theory Alert */}
        {highCreditNoTheoryStudents.length > 0 && (
          <Card className="glass-card border-warning/30 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-warning text-base">
                <BookOpen className="w-5 h-5" />
                Veel Credits, Nog Geen Theorie
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Deze leerlingen hebben meer dan 30 credits maar hebben hun theorie nog niet gehaald
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {highCreditNoTheoryStudents.map(({ student, credits }) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-warning/20 cursor-pointer hover:bg-background/80 transition-colors"
                  onClick={() => navigate(`/students`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-warning/30">
                      <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                      <AvatarFallback className="bg-warning/10 text-warning text-sm">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>@{student.username}</span>
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Theorie vereist!
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className="text-lg px-3 py-1 bg-warning text-warning-foreground">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {credits}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Students Overview */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="w-5 h-5 text-primary" />
              Alle Leerlingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allStudentsByCredits.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nog geen leerlingen
              </p>
            ) : (
              allStudentsByCredits.map(({ student, credits }) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/students`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">{student.name}</p>
                      <div className="flex items-center gap-1.5">
                        {student.theory_passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {student.theory_passed ? 'Theorie gehaald' : 'Geen theorie'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getCreditBadgeVariant(credits)} className="px-2.5 py-0.5">
                    {credits}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}