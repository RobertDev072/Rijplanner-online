/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * AI Coach Card Component
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Target, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AIInsights } from '@/types';
import { cn } from '@/lib/utils';

interface AICoachCardProps {
  studentId: string;
  initialInsights?: AIInsights | null;
}

export function AICoachCard({ studentId, initialInsights }: AICoachCardProps) {
  const [insights, setInsights] = useState<AIInsights | null>(initialInsights || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!initialInsights && !insights) {
      fetchInsights();
    }
  }, [studentId]);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('ai_insights')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      
      if (data?.ai_insights) {
        setInsights(data.ai_insights as unknown as AIInsights);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-student-progress', {
        body: { student_id: studentId }
      });

      if (error) throw error;
      
      if (data?.insights) {
        setInsights(data.insights);
        toast.success('AI-analyse voltooid!');
      }
    } catch (error: any) {
      console.error('Error analyzing progress:', error);
      if (error.message?.includes('429')) {
        toast.error('Te veel verzoeken. Probeer het later opnieuw.');
      } else if (error.message?.includes('402')) {
        toast.error('AI-credits zijn op. Neem contact op met de beheerder.');
      } else {
        toast.error('Analyse mislukt. Probeer het later opnieuw.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success to-success/70';
    if (score >= 60) return 'from-primary to-primary/70';
    if (score >= 40) return 'from-warning to-warning/70';
    return 'from-destructive to-destructive/70';
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            AI Coach
            <Sparkles className="w-4 h-4 text-warning ml-auto animate-pulse" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {insights ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Overall Score */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                    getScoreGradient(insights.overall_score)
                  )}>
                    <span className="text-2xl font-bold text-white">
                      {insights.overall_score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Totale voortgang</p>
                    <Progress 
                      value={insights.overall_score} 
                      className="h-2 mt-1"
                    />
                  </div>
                </div>

                {/* Estimated Lessons */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Geschatte lessen tot examen</p>
                    <p className="text-2xl font-bold text-primary">
                      {insights.estimated_lessons_to_exam}
                    </p>
                  </div>
                </div>

                {/* Weaknesses */}
                {insights.top_weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Aandachtspunten
                    </p>
                    <ul className="space-y-1">
                      {insights.top_weaknesses.map((weakness, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-warning">•</span>
                          {weakness}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Last analyzed */}
                <p className="text-xs text-muted-foreground text-center">
                  Laatst geanalyseerd: {new Date(insights.last_analyzed_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* Refresh button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={analyzeProgress}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyseren...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Heranalyse
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="no-insights"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Nog geen AI-analyse beschikbaar
                </p>
                <Button
                  onClick={analyzeProgress}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyseren...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Start AI-analyse
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
