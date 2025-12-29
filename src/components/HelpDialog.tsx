/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { useState } from 'react';
import { HelpCircle, Calendar, Users, Car, Bell, Coins, FileText, Settings, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpTopic {
  icon: React.ElementType;
  title: string;
  description: string;
  roles: string[];
}

const helpTopics: HelpTopic[] = [
  {
    icon: Calendar,
    title: 'Agenda',
    description: 'Bekijk al je geplande lessen in een overzichtelijke kalender. Tik op een dag om details te zien. Je kunt lessen aanvragen door op een lege dag te tikken.',
    roles: ['admin', 'instructor', 'student'],
  },
  {
    icon: Bell,
    title: 'Notificaties',
    description: 'Je ontvangt automatisch meldingen voor nieuwe lesaanvragen, bevestigingen en herinneringen. Zorg dat je push notificaties hebt ingeschakeld.',
    roles: ['admin', 'instructor', 'student'],
  },
  {
    icon: Users,
    title: 'Leerlingen Beheren',
    description: 'Bekijk en beheer al je leerlingen. Je kunt hun voortgang zien, credits toewijzen en nieuwe leerlingen toevoegen via het Gebruikers menu.',
    roles: ['admin', 'instructor'],
  },
  {
    icon: Coins,
    title: 'Credits Systeem',
    description: 'Leerlingen hebben credits nodig om lessen te kunnen boeken. Als admin kun je credits toewijzen. Elke geaccepteerde les kost 1 credit.',
    roles: ['admin', 'instructor'],
  },
  {
    icon: Coins,
    title: 'Mijn Credits',
    description: 'Je hebt credits nodig om lessen te boeken. Elke les kost 1 credit. Neem contact op met je rijschool om credits aan te schaffen.',
    roles: ['student'],
  },
  {
    icon: FileText,
    title: 'Feedback',
    description: 'Na elke voltooide les krijg je feedback van je instructeur. Bekijk je voortgang en tips in het Feedback scherm.',
    roles: ['student'],
  },
  {
    icon: FileText,
    title: 'Feedback Geven',
    description: 'Na elke les kun je feedback geven over de prestaties van de leerling. Dit helpt bij het volgen van de voortgang.',
    roles: ['admin', 'instructor'],
  },
  {
    icon: Car,
    title: 'Voertuigen',
    description: 'Beheer het wagenpark van je rijschool. Voeg voertuigen toe, bewerk gegevens en koppel ze aan instructeurs.',
    roles: ['admin'],
  },
  {
    icon: Settings,
    title: 'Instellingen',
    description: 'Pas de kleuren en branding van je rijschool aan. Upload een logo en stel je WhatsApp support nummer in.',
    roles: ['admin'],
  },
];

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { user } = useAuth();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const filteredTopics = helpTopics.filter(
    topic => user?.role && topic.roles.includes(user.role)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Hulp & Uitleg
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-2">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isExpanded = expandedTopic === topic.title;
              
              return (
                <div
                  key={topic.title}
                  className="border border-border/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.title)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground flex-1 text-left">
                      {topic.title}
                    </span>
                    <ChevronRight 
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                        {topic.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* General tips */}
            <div className="mt-4 p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">
                <strong>💡 Tip:</strong> Swipe naar beneden om de pagina te vernieuwen. 
                Data wordt automatisch elke minuut gesynchroniseerd.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
