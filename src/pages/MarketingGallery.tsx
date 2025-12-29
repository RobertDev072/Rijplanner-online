/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Car,
  MessageCircle,
  Bell,
  Coins,
  FileText,
  Settings,
  Shield,
  Sparkles,
  Play,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import all screenshots
import screenshotDashboard from '@/assets/screenshot-dashboard.png';
import screenshotAgenda from '@/assets/screenshot-agenda.png';
import screenshotInplannen from '@/assets/screenshot-inplannen.png';
import screenshotLesdetails from '@/assets/screenshot-lesdetails.png';
import screenshotLeerlingen from '@/assets/screenshot-leerlingen.png';
import screenshotProfiel from '@/assets/screenshot-profiel.png';
import screenshotMenu from '@/assets/screenshot-menu.png';
import mockupDashboard from '@/assets/mockup-dashboard.png';
import mockupAgenda from '@/assets/mockup-agenda.png';
import mockupProfile from '@/assets/mockup-profile.png';
import mockupStudents from '@/assets/mockup-students.png';

// Import device frames
import deviceIphoneFrame from '@/assets/device-iphone-frame.png';
import deviceAndroidFrame from '@/assets/device-android-frame.png';
import deviceTabletFrame from '@/assets/device-tablet-frame.png';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  roles: string[];
  color: string;
}

interface Screenshot {
  src: string;
  title: string;
  description: string;
  category: 'mobile' | 'tablet' | 'desktop';
}

const features: Feature[] = [
  {
    icon: Calendar,
    title: 'Slimme Agenda',
    description: 'Overzichtelijke kalender met dag-, week- en maandweergave. Lessen plannen met één klik.',
    roles: ['Admin', 'Instructeur', 'Leerling'],
    color: 'bg-blue-500',
  },
  {
    icon: Users,
    title: 'Leerlingbeheer',
    description: 'Volledige leerlingadministratie met voortgang, documenten en contactgegevens.',
    roles: ['Admin', 'Instructeur'],
    color: 'bg-purple-500',
  },
  {
    icon: Car,
    title: 'Voertuigbeheer',
    description: 'Beheer het wagenpark, koppel voertuigen aan instructeurs en track onderhoud.',
    roles: ['Admin'],
    color: 'bg-teal-500',
  },
  {
    icon: Coins,
    title: 'Credit Systeem',
    description: 'Flexibel credit systeem voor lesboekingen. Automatische afschrijving bij bevestiging.',
    roles: ['Admin', 'Instructeur'],
    color: 'bg-amber-500',
  },
  {
    icon: Bell,
    title: 'Push Notificaties',
    description: 'Automatische herinneringen voor lessen. Directe meldingen bij nieuwe aanvragen.',
    roles: ['Alle gebruikers'],
    color: 'bg-red-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integratie',
    description: 'Direct contact via WhatsApp. Configureerbaar supportnummer per rijschool.',
    roles: ['Leerling', 'Instructeur'],
    color: 'bg-green-500',
  },
  {
    icon: FileText,
    title: 'Feedback & Voortgang',
    description: 'Gedetailleerde feedback na elke les. Leerlingen zien hun voortgang realtime.',
    roles: ['Instructeur', 'Leerling'],
    color: 'bg-indigo-500',
  },
  {
    icon: Settings,
    title: 'White-label Branding',
    description: 'Eigen logo, kleuren en bedrijfsnaam. Volledig gepersonaliseerde app per rijschool.',
    roles: ['Admin'],
    color: 'bg-gray-500',
  },
  {
    icon: Smartphone,
    title: 'Native Apps',
    description: 'Beschikbaar als PWA en native app voor iOS en Android. Offline ondersteuning.',
    roles: ['Alle gebruikers'],
    color: 'bg-pink-500',
  },
  {
    icon: Shield,
    title: 'Multi-tenant Platform',
    description: 'Veilig gescheiden data per rijschool. Superadmin beheer voor het hele platform.',
    roles: ['Superadmin'],
    color: 'bg-slate-500',
  },
];

const screenshots: Screenshot[] = [
  { src: screenshotDashboard, title: 'Dashboard', description: 'Overzicht van alle activiteiten', category: 'mobile' },
  { src: screenshotAgenda, title: 'Agenda', description: 'Weekplanning in één oogopslag', category: 'mobile' },
  { src: screenshotInplannen, title: 'Les Inplannen', description: 'Selecteer leerling en tijd', category: 'mobile' },
  { src: screenshotLesdetails, title: 'Les Details', description: 'Volledige lesinformatie', category: 'mobile' },
  { src: screenshotLeerlingen, title: 'Leerlingen', description: 'Beheer al je leerlingen', category: 'mobile' },
  { src: screenshotProfiel, title: 'Profiel', description: 'Accountbeheer', category: 'mobile' },
  { src: screenshotMenu, title: 'Navigatie', description: 'Intuïtief menu', category: 'mobile' },
  { src: mockupDashboard, title: 'Dashboard Mockup', description: 'Clean design', category: 'tablet' },
  { src: mockupAgenda, title: 'Agenda Mockup', description: 'Overzichtelijk', category: 'tablet' },
  { src: mockupProfile, title: 'Profiel Mockup', description: 'Gebruiksvriendelijk', category: 'tablet' },
  { src: mockupStudents, title: 'Leerlingen Mockup', description: 'Gestructureerd', category: 'tablet' },
];

const testAccounts = [
  { role: 'Admin', username: 'admin', pincode: '1234', description: 'Volledige rijschoolbeheer' },
  { role: 'Instructeur', username: 'jan.bakker', pincode: '1234', description: 'Lesgeven en feedback' },
  { role: 'Leerling', username: 'emma.visser', pincode: '1234', description: 'Lessen boeken en bekijken' },
];

export default function MarketingGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('features');

  // Redirect non-superadmins
  if (user?.role !== 'superadmin') {
    navigate('/dashboard');
    return null;
  }

  const handleDownload = async (src: string, filename: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDownloadAll = async () => {
    for (const screenshot of screenshots) {
      const filename = `rijplanner-${screenshot.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      await handleDownload(screenshot.src, filename);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const openImageViewer = (screenshot: Screenshot, index: number) => {
    setSelectedImage(screenshot);
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % screenshots.length
      : (currentImageIndex - 1 + screenshots.length) % screenshots.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(screenshots[newIndex]);
  };

  return (
    <MobileLayout title="Marketing Gallery">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            RijPlanner Marketing Kit
          </h1>
          <p className="text-muted-foreground text-sm">
            Mockups, screenshots en feature overzichten voor presentaties
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs">Gallery</TabsTrigger>
            <TabsTrigger value="demo" className="text-xs">Demo</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border/50 rounded-xl p-4"
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {feature.roles.map(role => (
                            <span 
                              key={role}
                              className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Platform Support */}
            <div className="bg-muted/50 rounded-xl p-4 mt-6">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Ondersteunde Platforms</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">iOS & Android</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <Tablet className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Tablet</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Desktop</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            {/* Device Frames Section */}
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Device Mockup Frames
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Professionele device frames voor presentaties. Download en combineer met screenshots.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="relative aspect-[9/16] bg-muted/50 rounded-xl overflow-hidden mb-2 group">
                    <img src={deviceIphoneFrame} alt="iPhone Frame" className="w-full h-full object-contain" />
                    <button
                      onClick={() => handleDownload(deviceIphoneFrame, 'rijplanner-iphone-frame.png')}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Download className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <p className="text-xs font-medium">iPhone</p>
                </div>
                <div className="text-center">
                  <div className="relative aspect-[9/16] bg-muted/50 rounded-xl overflow-hidden mb-2 group">
                    <img src={deviceAndroidFrame} alt="Android Frame" className="w-full h-full object-contain" />
                    <button
                      onClick={() => handleDownload(deviceAndroidFrame, 'rijplanner-android-frame.png')}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Download className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <p className="text-xs font-medium">Android</p>
                </div>
                <div className="text-center">
                  <div className="relative aspect-[4/3] bg-muted/50 rounded-xl overflow-hidden mb-2 group">
                    <img src={deviceTabletFrame} alt="Tablet Frame" className="w-full h-full object-contain" />
                    <button
                      onClick={() => handleDownload(deviceTabletFrame, 'rijplanner-tablet-frame.png')}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Download className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <p className="text-xs font-medium">Tablet</p>
                </div>
              </div>
            </div>

            {/* Download All Button */}
            <Button 
              onClick={handleDownloadAll}
              className="w-full rounded-xl"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Alle Screenshots Downloaden ({screenshots.length})
            </Button>

            {/* Mobile Screenshots */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile Screenshots
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {screenshots.filter(s => s.category === 'mobile').map((screenshot, index) => (
                  <motion.div
                    key={screenshot.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openImageViewer(screenshot, screenshots.indexOf(screenshot))}
                    className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden cursor-pointer group border border-border/50"
                  >
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(screenshot.src, `rijplanner-${screenshot.title.toLowerCase().replace(/\s+/g, '-')}.png`);
                      }}
                      className="absolute bottom-1 right-1 w-6 h-6 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mockups */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tablet className="w-4 h-4" />
                Mockups
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {screenshots.filter(s => s.category === 'tablet').map((screenshot, index) => (
                  <motion.div
                    key={screenshot.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openImageViewer(screenshot, screenshots.indexOf(screenshot))}
                    className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden cursor-pointer group border border-border/50"
                  >
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-medium">{screenshot.title}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(screenshot.src, `rijplanner-${screenshot.title.toLowerCase().replace(/\s+/g, '-')}.png`);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-4">
            {/* Test Accounts */}
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Demo Accounts
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Gebruik deze accounts om de app te demonstreren aan potentiële klanten.
              </p>
              <div className="space-y-3">
                {testAccounts.map((account) => (
                  <div 
                    key={account.role}
                    className="bg-muted/50 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {account.role}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Gebruikersnaam</p>
                        <p className="font-mono font-medium text-foreground">{account.username}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pincode</p>
                        <p className="font-mono font-medium text-foreground">{account.pincode}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{account.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Tips */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                Demo Tips
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Start met het Admin account om het volledige beheer te tonen
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Demonstreer de agenda en het inplannen van lessen
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Toon de WhatsApp integratie voor directe communicatie
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Laat het credit systeem zien voor flexibel lesbeheer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Installeer de app op het homescreen om de native feel te demonstreren
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-auto py-3 flex-col"
                onClick={() => window.open('/login', '_blank')}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-xs">Open App</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-auto py-3 flex-col"
                onClick={() => window.open('/', '_blank')}
              >
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs">Landing Page</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Viewer Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          {selectedImage && (
            <div className="relative flex items-center justify-center h-[80vh]">
              {/* Navigation buttons */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-full max-w-full object-contain"
              />
              
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              {/* Caption */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="text-white font-medium text-sm">{selectedImage.title}</p>
                <p className="text-white/70 text-xs">{selectedImage.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
