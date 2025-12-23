import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Building2, 
  Download, 
  FileSpreadsheet,
  Save,
  Loader2
} from 'lucide-react';
import { exportLessonsToCSV, exportCreditsToCSV, exportFullReportToCSV } from '@/utils/csvExport';

interface TenantSettings {
  name: string;
  logo_url: string | null;
  primary_color: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { lessons, credits, users } = useData();
  const [settings, setSettings] = useState<TenantSettings>({
    name: '',
    logo_url: null,
    primary_color: '#3B82F6',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.tenant_id) {
      fetchSettings();
    }
  }, [user?.tenant_id]);

  const fetchSettings = async () => {
    if (!user?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('name, logo_url, primary_color')
        .eq('id', user.tenant_id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings({
          name: data.name,
          logo_url: data.logo_url,
          primary_color: data.primary_color || '#3B82F6',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Kon instellingen niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.tenant_id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: settings.name,
          logo_url: settings.logo_url,
          primary_color: settings.primary_color,
        })
        .eq('id', user.tenant_id);

      if (error) throw error;
      
      toast.success('Instellingen opgeslagen');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Kon instellingen niet opslaan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportLessons = () => {
    exportLessonsToCSV(lessons, users, `${settings.name}-lessen`);
    toast.success('Lessen geëxporteerd');
  };

  const handleExportCredits = () => {
    exportCreditsToCSV(credits, users, `${settings.name}-credits`);
    toast.success('Credits geëxporteerd');
  };

  const handleExportAll = () => {
    exportFullReportToCSV(lessons, credits, users, settings.name);
    toast.success('Volledige export gestart');
  };

  if (!user || user.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className="page-container">
        <Header title="Instellingen" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header title="Instellingen" />

      {/* Tenant Branding */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="section-title mb-4">
          <Building2 className="w-4 h-4 text-primary" />
          Rijschool gegevens
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Naam rijschool</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Naam van je rijschool"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={settings.logo_url || ''}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value || null })}
              placeholder="https://example.com/logo.png"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Voer de URL van je logo in (optioneel)
            </p>
          </div>
        </div>
      </div>

      {/* Color Settings */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="section-title mb-4">
          <Palette className="w-4 h-4 text-primary" />
          Kleuren
        </h3>
        
        <div>
          <Label htmlFor="primary_color">Primaire kleur</Label>
          <div className="flex gap-3 mt-1.5">
            <input
              type="color"
              id="primary_color"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer border border-border"
            />
            <Input
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            De hoofdkleur van je app (voor knoppen, accenten, etc.)
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full mt-4"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Instellingen opslaan
        </Button>
      </div>

      {/* Data Export */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="section-title mb-4">
          <Download className="w-4 h-4 text-primary" />
          Data export (CSV)
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Download een backup van je data in CSV formaat. 
          Dit kan geopend worden in Excel of Google Sheets.
        </p>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            onClick={handleExportLessons}
            className="w-full justify-start"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporteer lessen ({lessons.length})
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCredits}
            className="w-full justify-start"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporteer credits ({credits.length})
          </Button>
          
          <Button 
            onClick={handleExportAll}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4" />
            Volledige backup downloaden
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
