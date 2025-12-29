/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Calendar, 
  Users, 
  Car, 
  Bell, 
  Coins, 
  FileText, 
  Settings, 
  ChevronRight, 
  Home,
  Smartphone,
  MessageCircle,
  Shield,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Palette,
  Image,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HelpSection {
  icon: React.ElementType;
  title: string;
  items: {
    question: string;
    answer: string;
  }[];
  roles: string[];
}

const helpSections: HelpSection[] = [
  // ============ DASHBOARD ============
  {
    icon: Home,
    title: 'Dashboard',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Wat zie ik op het Dashboard?',
        answer: 'Het Dashboard is je startpagina. Je ziet een overzicht van je eerstvolgende lessen, je credits (leerlingen), recente activiteiten en snelle toegang tot belangrijke functies.'
      },
      {
        question: 'Hoe vernieuw ik mijn gegevens?',
        answer: 'Swipe naar beneden op je scherm om de pagina te vernieuwen. De app synchroniseert ook automatisch elke minuut met de server.'
      },
      {
        question: 'Wat betekent de badge op het menu?',
        answer: 'De rode badge op het menu-icoon toont het aantal wachtende lesaanvragen. Tik op de badge om direct naar de agenda te gaan.'
      }
    ]
  },

  // ============ AGENDA ============
  {
    icon: Calendar,
    title: 'Agenda & Planning',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Hoe bekijk ik mijn lessen?',
        answer: 'Ga naar Agenda om al je geplande lessen te zien. Je kunt wisselen tussen dag-, week- en maandweergave. Tik op een les voor meer details.'
      },
      {
        question: 'Hoe plan ik een nieuwe les in? (Leerling)',
        answer: 'Tik op een lege dag in de agenda en selecteer "Les Aanvragen". Kies de gewenste datum en tijd. Je instructeur ontvangt een melding en kan de les bevestigen.'
      },
      {
        question: 'Hoe plan ik een nieuwe les in? (Instructeur/Admin)',
        answer: 'Tik op een dag in de agenda of gebruik de "+" knop. Selecteer een leerling, kies datum en tijd, en bevestig. De leerling krijgt automatisch een melding.'
      },
      {
        question: 'Wat betekenen de verschillende kleuren?',
        answer: 'Oranje = Wachtend op bevestiging, Groen = Bevestigd/Geaccepteerd, Rood = Geannuleerd, Blauw = Voltooid. Dit helpt je snel de status van lessen te herkennen.'
      },
      {
        question: 'Hoe annuleer ik een les?',
        answer: 'Open de les door erop te tikken en kies "Annuleren". Let op: geannuleerde lessen worden teruggestort in credits (bij bevestigde lessen).'
      },
      {
        question: 'Kan ik een les wijzigen?',
        answer: 'Ja, open de les en tik op "Bewerken". Je kunt de datum, tijd en opmerkingen aanpassen. De andere partij ontvangt een melding van de wijziging.'
      }
    ]
  },

  // ============ LESSEN (Instructeur/Admin) ============
  {
    icon: BookOpen,
    title: 'Lessen Beheren',
    roles: ['admin', 'instructor'],
    items: [
      {
        question: 'Hoe accepteer ik een lesaanvraag?',
        answer: 'Ga naar Agenda of Lessen. Wachtende aanvragen zijn oranje gemarkeerd. Tik op de les en kies "Accepteren". De leerling krijgt automatisch een bevestiging.'
      },
      {
        question: 'Hoe markeer ik een les als voltooid?',
        answer: 'Open een geaccepteerde les en kies "Voltooien". Je kunt direct feedback toevoegen over de prestaties van de leerling.'
      },
      {
        question: 'Wat als een leerling niet komt opdagen?',
        answer: 'Markeer de les als voltooid met een opmerking over de no-show. Credits worden normaal afgeschreven tenzij je de les annuleert (credit wordt dan teruggestort).'
      },
      {
        question: 'Kan ik lessen in bulk bewerken?',
        answer: 'Momenteel kun je lessen individueel bewerken. Voor meerdere wijzigingen, ga naar het Lessen overzicht waar je kunt filteren en sorteren.'
      }
    ]
  },

  // ============ FEEDBACK ============
  {
    icon: FileText,
    title: 'Feedback & Voortgang',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Hoe geef ik feedback na een les? (Instructeur)',
        answer: 'Na het voltooien van een les kun je een beoordeling geven (1-5 sterren), geoefende onderwerpen selecteren en notities toevoegen over de voortgang.'
      },
      {
        question: 'Waar vind ik mijn feedback? (Leerling)',
        answer: 'Ga naar "Mijn Feedback" in het menu. Je ziet al je ontvangen feedback, je gemiddelde score en tips voor verbetering.'
      },
      {
        question: 'Welke onderwerpen kan ik bijhouden?',
        answer: 'Standaard onderwerpen zijn: Sturen, Schakelen, Spiegels, Voorrang, Verkeerslichten, Rotondes, Parkeren, Snelweg, en meer. Admins kunnen aangepaste onderwerpen toevoegen.'
      },
      {
        question: 'Hoe zie ik mijn voortgang?',
        answer: 'In het Feedback scherm zie je een grafiek van je scores over tijd. Je kunt ook zien welke onderwerpen extra aandacht nodig hebben.'
      }
    ]
  },

  // ============ CREDITS (Student) ============
  {
    icon: Coins,
    title: 'Mijn Credits',
    roles: ['student'],
    items: [
      {
        question: 'Wat zijn credits?',
        answer: 'Credits zijn je lestegoed. Elke les kost 1 credit. Je kunt alleen lessen aanvragen als je voldoende credits hebt.'
      },
      {
        question: 'Hoeveel credits heb ik?',
        answer: 'Je credit saldo is zichtbaar op je Dashboard en in je Profiel. Je ziet zowel je totale credits als het aantal beschikbare credits.'
      },
      {
        question: 'Hoe krijg ik meer credits?',
        answer: 'Neem contact op met je rijschool om credits aan te schaffen. Zij kunnen credits aan je account toevoegen. Gebruik de WhatsApp knop voor snel contact.'
      },
      {
        question: 'Wanneer worden credits afgeschreven?',
        answer: 'Credits worden afgeschreven zodra je les wordt geaccepteerd door de instructeur. Bij annulering van een bevestigde les krijg je je credit terug.'
      }
    ]
  },

  // ============ CREDITS (Admin/Instructeur) ============
  {
    icon: Coins,
    title: 'Credits Beheren',
    roles: ['admin', 'instructor'],
    items: [
      {
        question: 'Hoe ken ik credits toe aan een leerling?',
        answer: 'Ga naar Credits in het menu. Zoek de leerling en tik op "+ Credits". Voer het aantal toe te kennen credits in en bevestig.'
      },
      {
        question: 'Kan ik credits verwijderen?',
        answer: 'Als admin kun je het totaal aantal credits aanpassen. Verlaag het aantal om credits te verwijderen. Let op: dit kan niet ongedaan worden.'
      },
      {
        question: 'Hoe zie ik het credit overzicht?',
        answer: 'Het Credits scherm toont alle leerlingen met hun totale, gebruikte en beschikbare credits. Je kunt filteren op leerlingen met weinig credits.'
      },
      {
        question: 'Worden credits automatisch afgeschreven?',
        answer: 'Ja! Wanneer je een les accepteert, wordt automatisch 1 credit afgeschreven van de leerling. Bij annulering wordt deze teruggestort.'
      }
    ]
  },

  // ============ LEERLINGEN (Admin/Instructeur) ============
  {
    icon: Users,
    title: 'Leerlingen & Gebruikers',
    roles: ['admin', 'instructor'],
    items: [
      {
        question: 'Hoe voeg ik een nieuwe leerling toe?',
        answer: 'Ga naar Gebruikers en tik op "+ Gebruiker". Vul naam, gebruikersnaam en een pincode in. De leerling kan direct inloggen met deze gegevens.'
      },
      {
        question: 'Hoe wijzig ik leerlinggegevens?',
        answer: 'Tik op een leerling om het profiel te openen. Kies "Bewerken" om naam, contactgegevens of andere info aan te passen.'
      },
      {
        question: 'Kan ik een pincode resetten?',
        answer: 'Ja, open het profiel van de leerling en kies "Pincode Resetten". Voer een nieuwe 4-cijferige pincode in en deel deze met de leerling.'
      },
      {
        question: 'Hoe verwijder ik een leerling?',
        answer: 'Alleen admins kunnen gebruikers verwijderen. Open het profiel en kies "Verwijderen". Let op: alle lesgeschiedenis blijft behouden voor administratie.'
      },
      {
        question: 'Wat is het verschil tussen rollen?',
        answer: 'Admin: volledige toegang tot alle functies. Instructeur: kan lessen geven en leerlingen beheren. Leerling: kan lessen aanvragen en feedback bekijken.'
      }
    ]
  },

  // ============ VOERTUIGEN (Admin) ============
  {
    icon: Car,
    title: 'Voertuigen',
    roles: ['admin'],
    items: [
      {
        question: 'Hoe voeg ik een voertuig toe?',
        answer: 'Ga naar Voertuigen en tik op "+ Voertuig". Vul het merk, model en kenteken in. Je kunt optioneel een instructeur koppelen.'
      },
      {
        question: 'Hoe koppel ik een voertuig aan een instructeur?',
        answer: 'Bij het toevoegen of bewerken van een voertuig kun je een instructeur selecteren. Deze instructeur gebruikt dan standaard dit voertuig.'
      },
      {
        question: 'Kan ik meerdere voertuigen beheren?',
        answer: 'Ja, je kunt onbeperkt voertuigen toevoegen. Elk voertuig kan aan één instructeur worden gekoppeld.'
      }
    ]
  },

  // ============ INSTELLINGEN (Admin) ============
  {
    icon: Settings,
    title: 'Instellingen & Branding',
    roles: ['admin'],
    items: [
      {
        question: 'Hoe wijzig ik de kleuren van de app?',
        answer: 'Ga naar Instellingen. Onder "Branding" kun je de primaire en secundaire kleur instellen. Wijzigingen zijn direct zichtbaar voor alle gebruikers.'
      },
      {
        question: 'Hoe upload ik een logo?',
        answer: 'In Instellingen kun je een logo uploaden. Ondersteunde formaten: PNG, JPG, SVG. Optimale grootte: 200x200 pixels.'
      },
      {
        question: 'Hoe stel ik WhatsApp support in?',
        answer: 'Vul je WhatsApp nummer in bij Instellingen (inclusief landcode, bijv. +31612345678). Leerlingen kunnen dan direct contact opnemen via de app.'
      },
      {
        question: 'Wie ziet de branding wijzigingen?',
        answer: 'Alle gebruikers binnen je rijschool zien de aangepaste branding: instructeurs en leerlingen. Elke rijschool heeft eigen branding (white-label).'
      }
    ]
  },

  // ============ NOTIFICATIES ============
  {
    icon: Bell,
    title: 'Notificaties & Meldingen',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Hoe schakel ik notificaties in?',
        answer: 'Bij eerste gebruik vraagt de app toestemming voor notificaties. Klik "Toestaan". Je kunt dit later aanpassen in je telefooninstellingen.'
      },
      {
        question: 'Welke meldingen ontvang ik?',
        answer: 'Je ontvangt meldingen voor: nieuwe lesaanvragen, lesbevestigingen, annuleringen, lesherinneringen (24 uur voor aanvang), en nieuwe feedback.'
      },
      {
        question: 'Ik ontvang geen notificaties, wat nu?',
        answer: 'Controleer je telefooninstellingen: 1) Sta notificaties toe voor de app, 2) Zet "Niet storen" uit, 3) Controleer of de app op de achtergrond mag draaien.'
      },
      {
        question: 'Kan ik bepaalde meldingen uitschakelen?',
        answer: 'Momenteel ontvang je alle relevante meldingen. Je kunt notificaties volledig aan/uit zetten in je telefooninstellingen.'
      }
    ]
  },

  // ============ WHATSAPP ============
  {
    icon: MessageCircle,
    title: 'WhatsApp Integratie',
    roles: ['student'],
    items: [
      {
        question: 'Hoe neem ik contact op met de rijschool?',
        answer: 'Tik op de groene WhatsApp knop in het menu. Je wordt doorgestuurd naar WhatsApp met een vooraf ingevuld bericht.'
      },
      {
        question: 'Moet ik WhatsApp geïnstalleerd hebben?',
        answer: 'Ja, je hebt de WhatsApp app nodig op je telefoon. Op desktop kun je WhatsApp Web gebruiken.'
      },
      {
        question: 'Ik zie geen WhatsApp knop?',
        answer: 'De rijschool moet een WhatsApp nummer hebben ingesteld. Neem contact op via de reguliere telefoon of e-mail.'
      }
    ]
  },

  // ============ PROFIEL ============
  {
    icon: Shield,
    title: 'Profiel & Account',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Hoe wijzig ik mijn gegevens?',
        answer: 'Ga naar Profiel en tik op "Bewerken". Je kunt je naam, e-mail, telefoonnummer en adres aanpassen.'
      },
      {
        question: 'Hoe wijzig ik mijn pincode?',
        answer: 'In je Profiel kun je je pincode wijzigen. Voer je huidige pincode in ter verificatie en kies een nieuwe 4-cijferige code.'
      },
      {
        question: 'Kan ik mijn profielfoto wijzigen?',
        answer: 'Ja, tik op je huidige foto of avatar in het Profiel scherm. Je kunt een foto kiezen uit je galerij of een nieuwe maken.'
      },
      {
        question: 'Wat is mijn theorie-status? (Leerling)',
        answer: 'Je profiel toont of je theorie-examen is gehaald. Je instructeur of admin kan deze status bijwerken wanneer je slaagt.'
      },
      {
        question: 'Hoe log ik uit?',
        answer: 'Tik op het menu-icoon rechtsboven en kies "Uitloggen" onderaan het menu. Je moet opnieuw inloggen met je gebruikersnaam en pincode.'
      }
    ]
  },

  // ============ APP INSTALLATIE ============
  {
    icon: Smartphone,
    title: 'App Installatie',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'Hoe installeer ik de app op mijn telefoon?',
        answer: 'Open de app in Safari (iPhone) of Chrome (Android). Tik op "Delen" → "Zet op beginscherm" (iPhone) of het menu → "Toevoegen aan startscherm" (Android).'
      },
      {
        question: 'Werkt de app offline?',
        answer: 'Ja! Na installatie kun je je agenda en basisgegevens bekijken zonder internet. Wijzigingen worden gesynchroniseerd zodra je weer online bent.'
      },
      {
        question: 'Komt er een update melding?',
        answer: 'Ja, wanneer er een nieuwe versie beschikbaar is, krijg je een melding om te updaten. Tik op "Bijwerken" voor de nieuwste functies.'
      },
      {
        question: 'Is er ook een native app?',
        answer: 'RijPlanner is beschikbaar als PWA (web-app) die je kunt installeren. Native apps voor iOS en Android zijn beschikbaar in de App Store en Play Store.'
      }
    ]
  },

  // ============ PROBLEMEN OPLOSSEN ============
  {
    icon: AlertCircle,
    title: 'Problemen Oplossen',
    roles: ['admin', 'instructor', 'student'],
    items: [
      {
        question: 'De app laadt niet of is traag',
        answer: 'Probeer: 1) Swipe naar beneden om te vernieuwen, 2) Sluit en heropen de app, 3) Controleer je internetverbinding, 4) Wis de app cache in je telefooninstellingen.'
      },
      {
        question: 'Ik kan niet inloggen',
        answer: 'Controleer je gebruikersnaam en pincode. Pincode is 4 cijfers. Nog steeds problemen? Vraag je rijschool om je pincode te resetten.'
      },
      {
        question: 'Mijn wijzigingen worden niet opgeslagen',
        answer: 'Controleer je internetverbinding. De app toont een melding als je offline bent. Probeer later opnieuw of vernieuw de pagina.'
      },
      {
        question: 'Ik zie oude of verkeerde gegevens',
        answer: 'Swipe naar beneden om te vernieuwen. Als het probleem aanhoudt, log uit en weer in om alle gegevens opnieuw te laden.'
      },
      {
        question: 'Hoe meld ik een bug?',
        answer: 'Tik op "Bug Melden" in het menu. Beschrijf het probleem zo gedetailleerd mogelijk met stappen om het te reproduceren.'
      }
    ]
  }
];

const quickTips = [
  { icon: RefreshCw, tip: 'Swipe naar beneden om de pagina te vernieuwen' },
  { icon: Bell, tip: 'Rode badge = aantal wachtende lesaanvragen' },
  { icon: Calendar, tip: 'Tik op een dag om details te zien of les te plannen' },
  { icon: Coins, tip: 'Credits worden automatisch bijgewerkt' },
  { icon: Download, tip: 'Installeer de app voor de beste ervaring' },
  { icon: MessageCircle, tip: 'Groen = WhatsApp support beschikbaar' },
];

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('faq');

  const filteredSections = helpSections.filter(
    section => user?.role && section.roles.includes(user.role)
  );

  const toggleSection = (title: string) => {
    if (expandedSection === title) {
      setExpandedSection(null);
      setExpandedQuestion(null);
    } else {
      setExpandedSection(title);
      setExpandedQuestion(null);
    }
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Hulp & Handleiding
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="faq" className="text-xs">FAQ & Uitleg</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs">Snelle Tips</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(85vh-140px)]">
            {/* FAQ Tab */}
            <TabsContent value="faq" className="p-4 pt-2 space-y-2 mt-0">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSection === section.title;
                
                return (
                  <div
                    key={section.title}
                    className="border border-border/50 rounded-xl overflow-hidden"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground flex-1 text-left text-sm">
                        {section.title}
                      </span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {section.items.length} vragen
                      </span>
                      <ChevronRight 
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    {/* Questions */}
                    {isExpanded && (
                      <div className="border-t border-border/30">
                        {section.items.map((item, idx) => {
                          const isQuestionExpanded = expandedQuestion === item.question;
                          
                          return (
                            <div 
                              key={idx}
                              className={`border-b border-border/20 last:border-b-0 ${
                                isQuestionExpanded ? 'bg-muted/30' : ''
                              }`}
                            >
                              <button
                                onClick={() => toggleQuestion(item.question)}
                                className="w-full flex items-start gap-2 p-3 pl-14 text-left hover:bg-muted/20 transition-colors"
                              >
                                <ChevronRight 
                                  className={`w-3 h-3 text-primary mt-1 flex-shrink-0 transition-transform ${
                                    isQuestionExpanded ? 'rotate-90' : ''
                                  }`} 
                                />
                                <span className="text-sm text-foreground font-medium">
                                  {item.question}
                                </span>
                              </button>
                              
                              {isQuestionExpanded && (
                                <div className="px-4 pb-3 pl-[72px]">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Role indicator */}
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-primary">💡 Je rol: {user?.role === 'admin' ? 'Beheerder' : user?.role === 'instructor' ? 'Instructeur' : 'Leerling'}</strong>
                  <br />
                  Je ziet alleen de hulponderwerpen die relevant zijn voor jouw rol.
                </p>
              </div>
            </TabsContent>

            {/* Quick Tips Tab */}
            <TabsContent value="tips" className="p-4 pt-2 space-y-3 mt-0">
              <div className="grid gap-3">
                {quickTips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm text-foreground">{tip.tip}</p>
                    </div>
                  );
                })}
              </div>

              {/* Status legend */}
              <div className="mt-4 p-4 bg-card border border-border/50 rounded-xl">
                <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Status Kleuren
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-muted-foreground">Wachtend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Geaccepteerd</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-muted-foreground">Geannuleerd</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Voltooid</span>
                  </div>
                </div>
              </div>

              {/* App info */}
              <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                <h4 className="font-semibold text-foreground text-sm mb-2">
                  Over RijPlanner
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  RijPlanner is ontwikkeld door ROBERTDEV.NL voor moderne rijscholen. 
                  De app is beschikbaar als web-app en native apps voor iOS en Android.
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  © 2026 Robert Rocha / ROBERTDEV.NL
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}