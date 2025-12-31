/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Route Optimization Button Component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RouteOptimizeButtonProps {
  instructorId: string;
  date: string;
  lessonsCount: number;
  onOptimized?: () => void;
}

export function RouteOptimizeButton({ 
  instructorId, 
  date, 
  lessonsCount,
  onOptimized 
}: RouteOptimizeButtonProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (lessonsCount < 2) {
      toast.info('Minimaal 2 lessen nodig om te optimaliseren');
      return;
    }

    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-driving-route', {
        body: { instructor_id: instructorId, date }
      });

      if (error) throw error;

      if (data?.optimized) {
        toast.success(
          `AI heeft je route geoptimaliseerd. Besparing: ~${data.estimated_savings_km || 5} km`,
          {
            description: data.reasoning,
            duration: 5000,
          }
        );
        onOptimized?.();
      } else if (data?.message) {
        toast.info(data.message);
        if (data.lessons_without_address?.length > 0) {
          toast.warning(
            `Leerlingen zonder adres: ${data.lessons_without_address.join(', ')}`,
            { duration: 5000 }
          );
        }
      }
    } catch (error: any) {
      console.error('Error optimizing route:', error);
      if (error.message?.includes('429')) {
        toast.error('Te veel verzoeken. Probeer het later opnieuw.');
      } else if (error.message?.includes('402')) {
        toast.error('AI-credits zijn op. Neem contact op met de beheerder.');
      } else {
        toast.error('Optimalisatie mislukt. Probeer het later opnieuw.');
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  if (lessonsCount < 2) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleOptimize}
        disabled={isOptimizing}
        className="gap-2"
      >
        {isOptimizing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimaliseren...
          </>
        ) : (
          <>
            <Route className="w-4 h-4" />
            <span className="hidden sm:inline">Optimaliseer Route</span>
            <span className="sm:hidden">Route</span>
            <Sparkles className="w-3 h-3 text-warning" />
          </>
        )}
      </Button>
    </motion.div>
  );
}
