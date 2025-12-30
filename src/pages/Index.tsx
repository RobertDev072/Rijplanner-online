/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Sparkles,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import landing screenshots
import landingHero from '@/assets/landing-hero.png';
import landingDashboard from '@/assets/landing-dashboard.png';
import landingInstructor from '@/assets/landing-instructor.png';
import landingLessonDetail from '@/assets/landing-lesson-detail.png';
import landingStudents from '@/assets/landing-students.png';
import landingOnboarding from '@/assets/landing-onboarding.png';

// Simple floating icon - CSS animation only
const FloatingIcon = ({ 
  className, 
  children, 
  delay = '0s' 
}: { 
  className: string; 
  children: React.ReactNode;
  delay?: string;
}) => (
  <div 
    className={`absolute animate-float ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);

// App flow step component - simplified
const FlowStep = ({ 
  number, 
  title, 
  description, 
  image,
  reverse = false
}: { 
  number: string;
  title: string; 
  description: string;
  image: string;
  reverse?: boolean;
}) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16 animate-fade-in`}>
    <div className="flex-1 text-center md:text-left">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
        <Sparkles className="w-4 h-4" />
        Stap {number}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
    </div>
    
    <div className="flex-1 relative">
      <div className="relative mx-auto max-w-[280px] md:max-w-[320px]">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-50" />
        <div className="relative bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-[2.5rem] p-2 shadow-2xl">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
          <img 
            src={image} 
            alt={title}
            className="rounded-[2rem] w-full shadow-inner"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
);

// Feature card - simplified with CSS hover
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description,
  gradient
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
    
    <div className="relative z-10">
      <div className="w-14 h-14 bg-primary/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-5 transition-colors">
        <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
      </div>
      <h3 className="font-bold text-foreground group-hover:text-white text-xl mb-3 transition-colors">{title}</h3>
      <p className="text-muted-foreground group-hover:text-white/80 text-sm leading-relaxed transition-colors">{description}</p>
    </div>
  </div>
);

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
        <div className="flex flex-col items-center gap-4 animate-fade-in">
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
              <div
                key={i}
                className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
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
      {/* Simple gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
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
          </div>
          
          <div className="animate-fade-in">
            <Link to="/login">
              <Button className="rounded-xl shadow-lg shadow-primary/20 px-6">
                Inloggen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center">
        {/* Floating icons - CSS only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingIcon className="top-[15%] left-[8%]" delay="0s">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </FloatingIcon>

          <FloatingIcon className="top-[20%] right-[10%]" delay="0.5s">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg flex items-center justify-center rotate-12">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </FloatingIcon>

          <FloatingIcon className="bottom-[30%] right-[12%]" delay="1s">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </FloatingIcon>

          <FloatingIcon className="bottom-[25%] left-[5%]" delay="0.8s">
            <div className="w-14 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg flex items-center justify-center">
              <div className="w-8 h-1.5 bg-white/80 rounded-full" />
            </div>
          </FloatingIcon>

          <FloatingIcon className="top-[40%] right-[5%]" delay="1.5s">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg flex items-center justify-center rotate-12">
              <span className="text-white font-black text-lg">L</span>
            </div>
          </FloatingIcon>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
            {/* Logo badge */}
            <div className="inline-flex items-center gap-3 bg-card/80 backdrop-blur border border-border/50 rounded-full px-6 py-3 mb-8 shadow-lg">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-black text-[7px]">L</span>
                </div>
              </div>
              <span className="font-bold text-foreground text-lg">RijPlanner</span>
            </div>

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

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/30 text-base px-8 h-14 w-full sm:w-auto group">
                  Direct Beginnen
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a 
                href="https://wa.me/31687892174?text=Hallo%2C%20ik%20wil%20graag%20een%20demo%20van%20RijPlanner!" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-2xl text-base px-8 h-14 w-full sm:w-auto group border-2 border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Vraag een Demo aan
                </Button>
              </a>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-3xl opacity-50" />
            <img 
              src={landingHero}
              alt="RijPlanner App Preview"
              className="relative w-full rounded-2xl shadow-2xl"
              loading="eager"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </section>

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
          <div className="text-center mb-20">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              Hoe het werkt
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Van inloggen tot lesgeven
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ontdek hoe eenvoudig RijPlanner werkt in slechts een paar stappen.
            </p>
          </div>

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
            />
            
            <FlowStep
              number="3"
              title="Beheer je leerlingen eenvoudig"
              description="Alle leerlinggegevens op één plek. Voortgang, credits, theorie-status en directe communicatie via WhatsApp."
              image={landingStudents}
            />

            <FlowStep
              number="4"
              title="Bekijk les details met één tik"
              description="Open een les voor alle informatie: leerlinggegevens, locatie, voertuig en de mogelijkheid om feedback te geven."
              image={landingLessonDetail}
              reverse
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Alles wat je nodig hebt
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              RijPlanner biedt alle tools om je rijschool professioneel te runnen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Second promotional image section */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ontworpen voor instructeurs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Een overzichtelijk dashboard met alle functies die je dagelijks nodig hebt.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-[3rem] blur-3xl opacity-50" />
            <img 
              src={landingDashboard}
              alt="RijPlanner Dashboard"
              className="relative w-full rounded-2xl shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-white" />
                <span className="text-white/90 text-sm font-medium">Start vandaag nog</span>
              </div>
              
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
          </div>
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
              <a 
                href="https://www.instagram.com/rijplanner/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/rijplanner/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
