/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Car, 
  Calendar, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Star,
  Smartphone,
  Bell,
  Lock,
  MessageCircle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import new hero images
import heroLogin from '@/assets/landing-hero-login.png';
import heroDashboard from '@/assets/landing-hero-dashboard.png';

// Import app screenshots
import screenshotInstructorToday from '@/assets/screenshot-instructor-today.png';
import screenshotLessonDetail from '@/assets/screenshot-lesson-detail.png';
import screenshotLessonList from '@/assets/screenshot-lesson-list.png';
import screenshotAdminDashboard from '@/assets/screenshot-admin-dashboard.png';
import screenshotFeedback from '@/assets/screenshot-feedback.png';

// Animated gradient background
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
    
    {/* Animated orbs */}
    <motion.div
      className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl"
      animate={{
        y: [0, -50, 0],
        x: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl"
      animate={{
        y: [0, 40, 0],
        x: [0, -20, 0],
        scale: [1.1, 1, 1.1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-20 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-success/10 to-success/5 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Subtle grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
  </div>
);

// Feature card component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay,
  gradient
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
  gradient: string;
}) => (
  <motion.div
    className="group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:border-primary/40 overflow-hidden"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    {/* Gradient glow on hover */}
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
    
    <div className="relative z-10">
      <div className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Trust badge component
const TrustBadge = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <motion.div 
    className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-success" />
    </div>
    <div>
      <p className="font-semibold text-foreground text-sm">{title}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  </motion.div>
);

// Screenshot card component
const ScreenshotCard = ({ 
  image, 
  title, 
  description, 
  delay,
  badge
}: { 
  image: string; 
  title: string; 
  description: string; 
  delay: number;
  badge?: string;
}) => (
  <motion.div
    className="group relative flex-shrink-0 w-64 md:w-auto"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
  >
    <div className="relative bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-2 shadow-2xl border border-border/50 overflow-hidden group-hover:shadow-3xl transition-all duration-500">
      {/* Phone frame */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/80 rounded-full z-10" />
      
      {/* Screen */}
      <div className="relative rounded-[1.5rem] overflow-hidden bg-background">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-auto"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
      
      {/* Badge */}
      {badge && (
        <div className="absolute top-6 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {badge}
        </div>
      )}
    </div>
    
    {/* Title */}
    <div className="mt-4 text-center">
      <p className="font-bold text-foreground">{title}</p>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </motion.div>
);

const LANDING_SEEN_KEY = 'rijplanner_landing_seen';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [activeHeroImage, setActiveHeroImage] = useState(0);

  const heroImages = [
    { src: heroLogin, label: 'Inloggen' },
    { src: heroDashboard, label: 'Dashboard' },
  ];

  // Auto-switch hero images
  useEffect(() => {
    if (!showContent) return;
    
    const interval = setInterval(() => {
      setActiveHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showContent, heroImages.length]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        localStorage.setItem(LANDING_SEEN_KEY, 'true');
        navigate('/dashboard');
      } else {
        const hasSeenLanding = localStorage.getItem(LANDING_SEEN_KEY);
        if (hasSeenLanding) {
          navigate('/login');
        } else {
          setShowContent(true);
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !showContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-lg flex items-center justify-center shadow-md">
              <span className="text-accent-foreground font-black text-xs">L</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: 'Slimme Planning',
      description: 'Plan rijlessen moeiteloos met onze intuïtieve agenda. Bekijk beschikbaarheid in één oogopslag.',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Leerlingbeheer',
      description: 'Houd voortgang bij, beheer documenten en communiceer direct met je leerlingen.',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      icon: Smartphone,
      title: 'Mobiele App',
      description: 'Altijd en overal toegang via je smartphone. Werkt op iPhone en Android.',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integratie',
      description: 'Stuur direct een WhatsApp naar je leerlingen met één tik.',
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
    },
    {
      icon: Bell,
      title: 'Notificaties',
      description: 'Automatische herinneringen voor lessen zodat niemand een afspraak vergeet.',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      icon: Zap,
      title: 'Snelle Feedback',
      description: 'Geef direct feedback na elke les met onze snelle beoordelingssysteem.',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-lg flex items-center justify-center shadow-md">
                <span className="text-accent-foreground font-black text-[9px]">L</span>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">
              Rij<span className="text-primary">Planner</span>
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/login">
              <Button className="rounded-xl shadow-lg shadow-primary/25 font-semibold">
                Inloggen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              Speciaal voor Nederlandse rijscholen
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Rijlessen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                eenvoudig gepland.
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              De complete app voor rijscholen. Plan lessen, beheer leerlingen en bespaar uren tijd per week. Alles in één moderne app.
            </p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/login">
                <Button size="lg" className="rounded-xl shadow-xl shadow-primary/30 text-base px-8 h-14 w-full sm:w-auto font-semibold">
                  <Car className="w-5 h-5 mr-2" />
                  Direct Beginnen
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <TrustBadge icon={Shield} title="AVG-compliant" description="Privacy beschermd" />
              <TrustBadge icon={Lock} title="SSL beveiligd" description="Veilig & versleuteld" />
            </div>
          </motion.div>

          {/* Right - Hero image carousel */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-3xl scale-95" />
              
              {/* Image container with crossfade */}
              <div className="relative z-10 overflow-hidden rounded-2xl">
                {heroImages.map((image, index) => (
                  <motion.img
                    key={index}
                    src={image.src}
                    alt={`RijPlanner ${image.label}`}
                    className={`w-full h-auto ${index === 0 ? '' : 'absolute inset-0'}`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: activeHeroImage === index ? 1 : 0,
                      scale: activeHeroImage === index ? 1 : 1.05,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                ))}
              </div>

              {/* Image indicator dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveHeroImage(index)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                      activeHeroImage === index 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                        : 'bg-muted/80 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activeHeroImage === index ? 'bg-primary-foreground' : 'bg-current'
                    }`} />
                    <span className="text-xs font-medium">{image.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-muted/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              RijPlanner biedt alle tools om je rijschool efficiënt te runnen.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={0.1 + i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Gallery */}
      <section className="relative z-10 py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bekijk de app in actie
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ontdek hoe RijPlanner je dagelijkse werk eenvoudiger maakt.
            </p>
          </motion.div>

          {/* Screenshots carousel */}
          <div className="overflow-x-auto pb-6 -mx-6 px-6 md:overflow-visible">
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-6 min-w-max md:min-w-0">
              <ScreenshotCard
                image={screenshotInstructorToday}
                title="Instructeur Dashboard"
                description="Lessen van vandaag"
                delay={0.1}
                badge="Nieuw"
              />
              <ScreenshotCard
                image={screenshotLessonList}
                title="Lesoverzicht"
                description="Compacte weergave"
                delay={0.2}
              />
              <ScreenshotCard
                image={screenshotLessonDetail}
                title="Les Details"
                description="Alle info op één plek"
                delay={0.3}
              />
              <ScreenshotCard
                image={screenshotAdminDashboard}
                title="Admin Dashboard"
                description="Beheer je rijschool"
                delay={0.4}
              />
              <ScreenshotCard
                image={screenshotFeedback}
                title="Feedback"
                description="Lesbeoordelingen"
                delay={0.5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Second hero image section */}
      <section className="relative z-10 bg-gradient-to-b from-muted/30 to-background py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ontworpen voor professionals
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Van instructeur tot rijschoolhouder - RijPlanner past zich aan jouw rol aan.
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl blur-3xl scale-95" />
            <img
              src={heroDashboard}
              alt="RijPlanner Dashboard"
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/50 rounded-3xl p-10 md:p-16 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Klaar om te beginnen?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Neem contact op met je rijschool om toegang te krijgen tot RijPlanner.
              </p>
              <Link to="/login">
                <Button size="lg" className="rounded-xl shadow-xl shadow-primary/30 text-base px-10 h-14 font-semibold">
                  <Car className="w-5 h-5 mr-2" />
                  Naar Inloggen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 bg-muted/20 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-black text-[7px]">L</span>
                </div>
              </div>
              <span className="font-bold text-foreground">RijPlanner</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <TrustBadge icon={Shield} title="AVG-compliant" description="Privacy" />
              <TrustBadge icon={Lock} title="SSL" description="Beveiligd" />
              <TrustBadge icon={Star} title="Made in NL" description="Nederlands" />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>© 2026 Robert Rocha / ROBERTDEV.NL - Alle rechten voorbehouden</p>
            <p className="mt-1 text-xs">www.rijplanner.online</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sparkles icon component
const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

export default Index;
