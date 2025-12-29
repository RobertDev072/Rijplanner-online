import { useEffect, useState } from 'react';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import mockup images
import mockupDashboard from '@/assets/mockup-dashboard.png';
import mockupAgenda from '@/assets/mockup-agenda.png';
import mockupProfile from '@/assets/mockup-profile.png';
import mockupStudents from '@/assets/mockup-students.png';
// Animated background with floating elements
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
    
    {/* Floating circles */}
    <motion.div
      className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
      animate={{
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-40 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
      animate={{
        y: [0, 20, 0],
        scale: [1.1, 1, 1.1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// Feature card component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
}) => (
  <motion.div
    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
  >
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// Trust badge component
const TrustBadge = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <div className="w-5 h-5 bg-success/10 rounded-full flex items-center justify-center">
      <Icon className="w-3 h-3 text-success" />
    </div>
    <span className="text-sm">{text}</span>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        // Show landing page for non-authenticated users
        setShowContent(true);
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
            <Car className="w-12 h-12 text-primary" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px]">L</span>
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
    },
    {
      icon: Users,
      title: 'Leerlingbeheer',
      description: 'Houd voortgang bij, beheer documenten en communiceer direct met je leerlingen.',
    },
    {
      icon: Smartphone,
      title: 'Mobiele App',
      description: 'Altijd en overal toegang via je smartphone. Werkt op iPhone en Android.',
    },
    {
      icon: Bell,
      title: 'Notificaties',
      description: 'Automatische herinneringen voor lessen zodat niemand een afspraak vergeet.',
    },
    {
      icon: Shield,
      title: 'Veilig & Betrouwbaar',
      description: 'Jouw gegevens zijn veilig. AVG-compliant en gehost in Nederland.',
    },
    {
      icon: Clock,
      title: 'Tijdbesparing',
      description: 'Minder administratie, meer tijd voor wat echt telt: lesgeven.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded flex items-center justify-center">
                <span className="text-accent-foreground font-black text-[8px]">L</span>
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
              <Button className="rounded-xl shadow-sm">
                Inloggen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust badges */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrustBadge icon={CheckCircle2} text="Gratis proberen" />
              <TrustBadge icon={Shield} text="AVG-compliant" />
              <TrustBadge icon={Star} text="Made in Nederland" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Rijlessen plannen{' '}
              <span className="text-primary">eenvoudig gemaakt</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              De complete oplossing voor rijscholen. Plan lessen, beheer leerlingen en 
              bespaar tijd met RijPlanner. Speciaal ontwikkeld voor Nederlandse rijscholen.
            </p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/login">
                <Button size="lg" className="rounded-xl shadow-lg text-base px-8 h-14 w-full sm:w-auto">
                  <Car className="w-5 h-5 mr-2" />
                  Direct Beginnen
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* App Preview - Floating cards */}
        <motion.div
          className="mt-16 md:mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-gradient-to-b from-card to-card/50 border border-border/50 rounded-3xl p-6 md:p-10 shadow-xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sample lesson cards */}
              {[
                { time: '09:00', name: 'Jan de Vries', status: 'Bevestigd' },
                { time: '11:00', name: 'Maria Peters', status: 'In afwachting' },
                { time: '14:00', name: 'Pieter Jansen', status: 'Bevestigd' },
              ].map((lesson, i) => (
                <motion.div
                  key={i}
                  className="bg-background border border-border/50 rounded-2xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{lesson.name}</p>
                      <p className="text-xs text-muted-foreground">{lesson.time} - Rijles</p>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                    lesson.status === 'Bevestigd' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      lesson.status === 'Bevestigd' ? 'bg-success' : 'bg-warning'
                    }`} />
                    {lesson.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-muted/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-14"
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
                delay={0.1 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Gallery Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bekijk de app in actie
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Een blik op de belangrijkste schermen van RijPlanner. Ontdek hoe eenvoudig het is.
            </p>
          </motion.div>

          {/* Screenshot Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { img: mockupDashboard, title: 'Dashboard', desc: 'Overzicht van alle lessen' },
              { img: mockupAgenda, title: 'Agenda', desc: 'Weekplanning in één oogopslag' },
              { img: mockupProfile, title: 'Profiel', desc: 'Leerling voortgang bijhouden' },
              { img: mockupStudents, title: 'Leerlingen', desc: 'Beheer al je leerlingen' },
            ].map((screen, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative bg-gradient-to-b from-muted/50 to-muted/20 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-lg border border-border/50 overflow-hidden group-hover:shadow-xl group-hover:border-primary/30 transition-all duration-300">
                  {/* Phone frame effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 md:h-1.5 bg-border/50 rounded-full mt-1" />
                  
                  <div className="relative rounded-xl md:rounded-2xl overflow-hidden mt-2">
                    <motion.img
                      src={screen.img}
                      alt={screen.title}
                      className="w-full h-auto object-cover"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 md:p-4 text-primary-foreground">
                        <p className="font-semibold text-sm md:text-base">{screen.title}</p>
                        <p className="text-[10px] md:text-xs opacity-90">{screen.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Title below on mobile */}
                <div className="mt-2 md:mt-3 text-center">
                  <p className="font-medium text-foreground text-sm">{screen.title}</p>
                  <p className="text-muted-foreground text-xs hidden md:block">{screen.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional info */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/50 rounded-full px-4 py-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Werkt op iPhone, Android en desktop
              </span>
            </div>
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
            <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/50 rounded-3xl p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Klaar om te beginnen?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Sluit je aan bij rijscholen die al gebruik maken van RijPlanner. 
                Start vandaag nog en ervaar het verschil.
              </p>
              <Link to="/login">
                <Button size="lg" className="rounded-xl shadow-lg text-base px-10 h-14">
                  Inloggen op RijPlanner
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-black text-[6px]">L</span>
                </div>
              </div>
              <span className="font-bold text-foreground">
                Rij<span className="text-primary">Planner</span>
              </span>
            </div>

            {/* Trust info */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                AVG-compliant
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                SSL beveiligd
              </span>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2026 RijPlanner
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Gebouwd door <span className="font-medium text-muted-foreground">ROBERTDEV.NL</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
