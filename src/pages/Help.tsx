import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  Car, 
  Settings, 
  MessageSquare,
  ClipboardList,
  UserCheck,
  Bell,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface GuideSection {
  icon: React.ElementType;
  title: string;
  description: string;
  steps: string[];
}

const instructorGuides: GuideSection[] = [
  {
    icon: Calendar,
    title: 'Lessen Inplannen',
    description: 'Hoe plan je een nieuwe rijles in?',
    steps: [
      'Ga naar "Inplannen" in het menu',
      'Selecteer een leerling uit de lijst',
      'Kies een datum en starttijd',
      'Selecteer de duur van de les (standaard 60 minuten)',
      'Optioneel: kies een voertuig',
      'Klik op "Les Inplannen" om te bevestigen'
    ]
  },
  {
    icon: ClipboardList,
    title: 'Agenda Beheren',
    description: 'Bekijk en beheer je geplande lessen',
    steps: [
      'Ga naar "Agenda" om al je lessen te zien',
      'Lessen worden getoond per dag',
      'Klik op een les voor meer details',
      'Je kunt lessen accepteren, voltooien of annuleren',
      'Voltooide lessen kunnen feedback krijgen'
    ]
  },
  {
    icon: Users,
    title: 'Leerlingen Beheren',
    description: 'Overzicht van je leerlingen',
    steps: [
      'Ga naar "Leerlingen" voor een overzicht',
      'Zie hoeveel lessen elke leerling heeft gehad',
      'Bekijk de voortgang en theorie-status',
      'Zoek leerlingen met de zoekbalk',
      'Klik op een leerling voor details'
    ]
  },
  {
    icon: MessageSquare,
    title: 'Feedback Geven',
    description: 'Geef feedback na elke les',
    steps: [
      'Open een voltooide les in je agenda',
      'Klik op "Feedback geven"',
      'Geef een beoordeling (1-5 sterren)',
      'Selecteer geoefende onderwerpen',
      'Voeg optionele notities toe',
      'Sla de feedback op'
    ]
  }
];

const adminGuides: GuideSection[] = [
  {
    icon: Users,
    title: 'Gebruikers Beheren',
    description: 'Beheer alle gebruikers van je rijschool',
    steps: [
      'Ga naar "Gebruikers" in het menu',
      'Bekijk alle instructeurs en leerlingen',
      'Voeg nieuwe gebruikers toe met de "+" knop',
      'Bewerk bestaande gebruikers door te klikken',
      'Verwijder gebruikers indien nodig'
    ]
  },
  {
    icon: BookOpen,
    title: 'Lessen Overzicht',
    description: 'Bekijk alle lessen van je rijschool',
    steps: [
      'Ga naar "Lessen" voor een totaaloverzicht',
      'Filter op status, datum of instructeur',
      'Exporteer gegevens naar CSV',
      'Bekijk statistieken en trends'
    ]
  },
  {
    icon: Car,
    title: 'Voertuigen Beheren',
    description: 'Beheer het wagenpark',
    steps: [
      'Ga naar "Voertuigen" in het menu',
      'Voeg nieuwe voertuigen toe',
      'Koppel voertuigen aan instructeurs',
      'Bewerk of verwijder voertuigen'
    ]
  },
  {
    icon: Settings,
    title: 'Instellingen',
    description: 'Configureer je rijschool',
    steps: [
      'Ga naar "Instellingen"',
      'Pas het logo en kleuren aan',
      'Configureer WhatsApp support nummer',
      'Beheer feature flags'
    ]
  }
];

const faqItems = [
  {
    question: 'Wat betekenen de verschillende les-statussen?',
    answer: 'Pending: les is aangevraagd, wacht op bevestiging. Accepted: les is bevestigd. Completed: les is afgerond. Cancelled: les is geannuleerd.'
  },
  {
    question: 'Hoe werken leskredieten?',
    answer: 'Elke leerling heeft een tegoed aan lessen. Bij het inplannen van een les wordt een krediet gereserveerd. Na voltooiing wordt het krediet definitief afgeschreven.'
  },
  {
    question: 'Kan ik een les annuleren?',
    answer: 'Ja, zowel instructeurs als leerlingen kunnen lessen annuleren. Geannuleerde lessen worden niet afgeschreven van het lessentegoed.'
  },
  {
    question: 'Hoe zie ik of een leerling theorie heeft gehaald?',
    answer: 'In het leerlingenoverzicht zie je een badge bij leerlingen die hun theorie hebben gehaald. Admins kunnen dit aanpassen in het gebruikersbeheer.'
  },
  {
    question: 'Hoe werken pushmeldingen?',
    answer: 'Je ontvangt meldingen voor nieuwe lessen, wijzigingen en herinneringen. Zorg dat je meldingen hebt ingeschakeld in je browser of app.'
  }
];

export default function Help() {
  const { user } = useAuth();
  
  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';
  
  const guides = isAdmin ? [...adminGuides, ...instructorGuides.slice(0, 2)] : instructorGuides;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Handleiding</h1>
          <p className="text-muted-foreground mt-2">
            Leer hoe je het meeste uit de app haalt
          </p>
          <Badge variant="secondary" className="mt-2">
            {isAdmin ? 'Admin' : 'Instructeur'}
          </Badge>
        </motion.div>

        {/* Role Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Jouw Rol: {isAdmin ? 'Beheerder' : 'Instructeur'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <p className="text-sm text-muted-foreground">
                  Als beheerder heb je volledige toegang tot alle functies van de rijschool. 
                  Je kunt gebruikers beheren, lessen inzien, voertuigen configureren en 
                  instellingen aanpassen. Je hebt ook toegang tot alle instructeur-functies.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Als instructeur kun je lessen inplannen met je leerlingen, je agenda beheren,
                  feedback geven na voltooide lessen en de voortgang van je leerlingen volgen.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Guides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Stap-voor-stap Handleidingen
          </h2>
          
          <div className="grid gap-4">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <guide.icon className="w-5 h-5 text-primary" />
                      {guide.title}
                    </CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="text-primary font-medium min-w-[20px]">
                            {stepIndex + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Veelgestelde Vragen
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Snelle Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Swipe</strong> naar links/rechts om snel tussen pagina's te navigeren</p>
              <p>• <strong>Pull down</strong> om gegevens te verversen</p>
              <p>• <strong>Installeer de app</strong> voor een betere ervaring (klik op delen → Voeg toe aan startscherm)</p>
              <p>• <strong>Donkere modus</strong> is beschikbaar in je profiel-instellingen</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
