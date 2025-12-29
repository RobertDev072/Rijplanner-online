/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  HelpCircle,
  MessageCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import new landing screenshots
import landingHero from '@/assets/landing-hero.png';
import landingDashboard from '@/assets/landing-dashboard.png';
import landingInstructor from '@/assets/landing-instructor.png';
import landingLessonDetail from '@/assets/landing-lesson-detail.png';
import landingStudents from '@/assets/landing-students.png';
import landingProfile from '@/assets/landing-profile.png';
import landingOnboarding from '@/assets/landing-onboarding.png';
import landingHelp from '@/assets/landing-help.png';

// Floating 3D icons component
const FloatingIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Location pin */}
    <motion.div
      className="absolute top-[15%] left-[8%] w-12 h-12"
      animate={{ 
        y: [0, -15, 0],
        rotate: [-5, 5, -5]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-emerald-500" />
    </motion.div>

    {/* Bell notification */}
    <motion.div
      className="absolute top-[20%] right-[10%] w-10 h-10"
      animate={{ 
        y: [0, 10, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
    >
      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-orange-500/30 flex items-center justify-center transform rotate-12">
        <Bell className="w-5 h-5 text-white" />
      </div>
    </motion.div>

    {/* Calendar icon */}
    <motion.div
      className="absolute bottom-[30%] right-[12%] w-12 h-12"
      animate={{ 
        y: [0, -12, 0],
        x: [0, 5, 0]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    >
      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center">
        <Calendar className="w-6 h-6 text-white" />
      </div>
    </motion.div>

    {/* Credit card */}
    <motion.div
      className="absolute bottom-[25%] left-[5%] w-14 h-10"
      animate={{ 
        y: [0, 8, 0],
        rotate: [-10, -5, -10]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
    >
      <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center">
        <div className="w-8 h-1.5 bg-white/80 rounded-full" />
      </div>
    </motion.div>

    {/* L badge floating */}
    <motion.div
      className="absolute top-[40%] right-[5%] w-10 h-10"
      animate={{ 
        y: [0, -20, 0],
        rotate: [15, 25, 15]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
    >
      <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center transform rotate-12">
        <span className="text-white font-black text-lg">L</span>
      </div>
    </motion.div>
  </div>
);

// Animated gradient background
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
    
    {/* Animated orbs */}
    <motion.div
      className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
  </div>
);

// App flow step component
const FlowStep = ({ 
  number, 
  title, 
  description, 
  image,
  reverse = false,
  delay = 0
}: { 
  number: string;
  title: string; 
  description: string;
  image: string;
  reverse?: boolean;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Text content */}
      <div className="flex-1 text-center md:text-left">
        <motion.div 
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
          initial={{ scale: 0.8 }}
          animate={isInView ? { scale: 1 } : { scale: 0.8 }}
          transition={{ delay: delay + 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          Stap {number}
        </motion.div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
      </div>
      
      {/* Image */}
      <motion.div 
        className="flex-1 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        <div className="relative mx-auto max-w-[280px] md:max-w-[320px]">
          {/* Phone frame effect */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-50" />
          <div className="relative bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-[2.5rem] p-2 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
            <img 
              src={image} 
              alt={title}
              className="rounded-[2rem] w-full shadow-inner"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Feature card with hover effect
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
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Hover gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-primary/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-5 transition-colors">
          <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
        </div>
        <h3 className="font-bold text-foreground group-hover:text-white text-xl mb-3 transition-colors">{title}</h3>
        <p className="text-muted-foreground group-hover:text-white/80 text-sm leading-relaxed transition-colors">{description}</p>
      </div>
    </motion.div>
  );
};

// Trust badge
const TrustBadge = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center p-6">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h4 className="font-bold text-foreground mb-1">{title}</h4>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const LANDING_SEEN_KEY = 'rijplanner_landing_seen';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

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
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-black text-xs">L</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
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
      description: 'Plan rijlessen moeiteloos met onze intuïtieve kalender. Bekijk beschikbaarheid direct.',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Leerlingbeheer',
      description: 'Houd voortgang bij en communiceer direct met je leerlingen via WhatsApp.',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      icon: Smartphone,
      title: 'Mobiele App',
      description: 'Altijd toegang via je smartphone. Werkt perfect op iPhone en Android.',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      icon: Bell,
      title: 'Push Notificaties',
      description: 'Automatische herinneringen zodat niemand een les vergeet.',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'AVG-Compliant',
      description: 'Jouw gegevens zijn veilig. Volledig AVG-compliant en gehost in Nederland.',
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-600'
    },
    {
      icon: Clock,
      title: 'Tijdbesparing',
      description: 'Minder administratie, meer tijd voor wat echt telt: lesgeven.',
      gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600'
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-md flex items-center justify-center shadow-md">
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
              <Button className="rounded-xl shadow-lg shadow-primary/20 px-6">
                Inloggen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 min-h-[90vh] flex flex-col justify-center"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <FloatingIcons />
        
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo badge */}
              <motion.div
                className="inline-flex items-center gap-3 bg-card/80 backdrop-blur border border-border/50 rounded-full px-6 py-3 mb-8 shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded flex items-center justify-center">
                    <span className="text-accent-foreground font-black text-[7px]">L</span>
                  </div>
                </div>
                <span className="font-bold text-foreground text-lg">RijPlanner</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                Rijlessen{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                  eenvoudig gepland.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                De complete app voor rijscholen. Plan lessen, beheer leerlingen en 
                communiceer direct. Speciaal ontwikkeld voor Nederlandse rijinstructeurs.
              </p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/login">
                  <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/30 text-base px-8 h-14 w-full sm:w-auto group">
                    Direct Beginnen
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero image - Main promotional image */}
          <motion.div
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-3xl opacity-50" />
            <img 
              src={landingHero}
              alt="RijPlanner App Preview"
              className="relative w-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground/50" />
        </motion.div>
      </motion.section>

      {/* Trust badges section */}
      <section className="relative z-10 py-12 border-y border-border/30 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4">
            <TrustBadge 
              icon={Shield} 
              title="AVG-Compliant" 
              description="Uitgebreide privacy bescherming" 
            />
            <TrustBadge 
              icon={Lock} 
              title="SSL Beveiligd" 
              description="Veilig & versleuteld" 
            />
            <TrustBadge 
              icon={HelpCircle} 
              title="Direct Hulp" 
              description="Ondersteuning voor instructeurs" 
            />
          </div>
        </div>
      </section>

      {/* App Flow Section */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              Hoe het werkt
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Van inloggen tot lesgeven
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ontdek hoe eenvoudig RijPlanner werkt in slechts een paar stappen.
            </p>
          </motion.div>

          <div className="space-y-24 md:space-y-32">
            <FlowStep
              number="1"
              title="Log veilig in met je pincode"
              description="Geen gedoe met wachtwoorden. Log snel in met je persoonlijke 4-cijferige pincode. Simpel en veilig."
              image={landingOnboarding}
            />
            
            <FlowStep
              number="2"
              title="Bekijk je lessen in één oogopslag"
              description="Je dashboard toont direct alle komende lessen. Zie wie er wanneer komt en bereid je voor op de dag."
              image={landingInstructor}
              reverse
              delay={0.1}
            />
            
            <FlowStep
              number="3"
              title="Beheer je leerlingen eenvoudig"
              description="Alle leerlinggegevens op één plek. Voortgang, credits, theorie-status en directe communicatie via WhatsApp."
              image={landingStudents}
              delay={0.2}
            />

            <FlowStep
              number="4"
              title="Bekijk les details met één tik"
              description="Open een les voor alle informatie: leerlinggegevens, locatie, voertuig en de mogelijkheid om feedback te geven."
              image={landingLessonDetail}
              reverse
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Alles wat je nodig hebt
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              RijPlanner biedt alle tools om je rijschool professioneel te runnen.
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
                delay={0.1 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Second promotional image section */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ontworpen voor instructeurs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Een overzichtelijk dashboard met alle functies die je dagelijks nodig hebt.
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-[3rem] blur-3xl opacity-50" />
            <img 
              src={landingDashboard}
              alt="RijPlanner Dashboard"
              className="relative w-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            className="relative bg-gradient-to-br from-primary via-primary to-primary/90 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl shadow-primary/30"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
              >
                <Star className="w-4 h-4 text-white" />
                <span className="text-white/90 text-sm font-medium">Start vandaag nog</span>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Klaar om je rijschool te moderniseren?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Sluit je aan bij rijscholen die al profiteren van efficiëntere lesplanning met RijPlanner.
              </p>
              
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="rounded-2xl shadow-xl text-base px-10 h-14 bg-white text-primary hover:bg-white/90 group"
                >
                  Aan de slag
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 bg-muted/20 backdrop-blur-sm py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-black text-[7px]">L</span>
                </div>
              </div>
              <div>
                <span className="font-bold text-foreground">RijPlanner</span>
                <p className="text-xs text-muted-foreground">Rijlessen eenvoudig gepland</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a 
                href="https://rijplanner.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                www.rijplanner.online
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 RijPlanner - Robert Rocha / ROBERTDEV.NL. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
