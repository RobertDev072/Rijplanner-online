import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Bell, 
  Car, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'rijplanner_onboarding_complete';

interface OnboardingSlide {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const getSlidesByRole = (role: string): OnboardingSlide[] => {
  const commonSlides: OnboardingSlide[] = [
    {
      icon: Calendar,
      title: 'Agenda',
      description: 'Bekijk al je geplande lessen in een overzichtelijke kalender. Tik op een dag om de details te zien.',
      color: 'bg-blue-500',
    },
    {
      icon: Bell,
      title: 'Notificaties',
      description: 'Ontvang automatische herinneringen voor je lessen zodat je nooit een afspraak mist.',
      color: 'bg-amber-500',
    },
  ];

  if (role === 'student') {
    return [
      {
        icon: Sparkles,
        title: 'Welkom bij RijPlanner!',
        description: 'Je persoonlijke rijles-app. Plan lessen, bekijk je voortgang en blijf op de hoogte.',
        color: 'bg-primary',
      },
      ...commonSlides,
      {
        icon: Car,
        title: 'Les Aanvragen',
        description: 'Vraag eenvoudig nieuwe lessen aan via de agenda. Je instructeur krijgt direct een melding.',
        color: 'bg-green-500',
      },
    ];
  }

  if (role === 'instructor') {
    return [
      {
        icon: Sparkles,
        title: 'Welkom bij RijPlanner!',
        description: 'Beheer je lessen en leerlingen efficiënt. Alles wat je nodig hebt op één plek.',
        color: 'bg-primary',
      },
      ...commonSlides,
      {
        icon: Users,
        title: 'Leerlingen',
        description: 'Bekijk al je leerlingen, hun voortgang en plan direct nieuwe lessen in.',
        color: 'bg-purple-500',
      },
    ];
  }

  // Admin
  return [
    {
      icon: Sparkles,
      title: 'Welkom bij RijPlanner!',
      description: 'Beheer je rijschool volledig. Instructeurs, leerlingen, voertuigen en meer.',
      color: 'bg-primary',
    },
    ...commonSlides,
    {
      icon: Users,
      title: 'Gebruikersbeheer',
      description: 'Voeg instructeurs en leerlingen toe, beheer credits en bekijk statistieken.',
      color: 'bg-purple-500',
    },
    {
      icon: Car,
      title: 'Voertuigen',
      description: 'Beheer je wagenpark en koppel voertuigen aan lessen.',
      color: 'bg-teal-500',
    },
  ];
};

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
      if (!hasCompletedOnboarding) {
        // Small delay to let dashboard load first
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!user || !isOpen) return null;

  const slides = getSlidesByRole(user.role);
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          {/* Skip button */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
            >
              Overslaan
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Slide content */}
          <div className="px-8 pb-8 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={`w-20 h-20 ${slide.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => prev - 1)}
                  className="flex-1 rounded-xl h-12"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Terug
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (isLastSlide) {
                    handleComplete();
                  } else {
                    setCurrentSlide(prev => prev + 1);
                  }
                }}
                className={`flex-1 rounded-xl h-12 ${currentSlide === 0 ? 'w-full' : ''}`}
              >
                {isLastSlide ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aan de slag!
                  </>
                ) : (
                  <>
                    Volgende
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
