import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface TenantTheme {
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface ThemeContextType {
  theme: TenantTheme;
  isLoading: boolean;
  updateTheme: (updates: Partial<TenantTheme>) => Promise<boolean>;
  refreshTheme: () => Promise<void>;
}

const defaultTheme: TenantTheme = {
  name: '',
  logo_url: null,
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Apply theme colors to CSS custom properties
function applyThemeColors(primary: string, secondary: string) {
  const root = document.documentElement;
  
  try {
    const primaryHSL = hexToHSL(primary);
    const secondaryHSL = hexToHSL(secondary);
    
    // Set primary color
    root.style.setProperty('--primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty('--primary-foreground', primaryHSL.l > 50 ? '0 0% 0%' : '0 0% 100%');
    
    // Set accent/secondary color
    root.style.setProperty('--accent', `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
    root.style.setProperty('--accent-foreground', secondaryHSL.l > 50 ? '0 0% 0%' : '0 0% 100%');
    
    // Also set ring color to match primary
    root.style.setProperty('--ring', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    
    // Update sidebar primary to match
    root.style.setProperty('--sidebar-primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty('--sidebar-accent', `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
    
    console.log('Theme colors applied:', { primary, secondary, primaryHSL, secondaryHSL });
  } catch (error) {
    console.error('Error applying theme colors:', error);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<TenantTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTheme = useCallback(async () => {
    if (!user?.tenant_id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('name, logo_url, primary_color, secondary_color')
        .eq('id', user.tenant_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const newTheme: TenantTheme = {
          name: data.name,
          logo_url: data.logo_url,
          primary_color: data.primary_color || '#3B82F6',
          secondary_color: data.secondary_color || '#10B981',
        };
        setTheme(newTheme);
        applyThemeColors(newTheme.primary_color, newTheme.secondary_color);
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenant_id]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  const updateTheme = async (updates: Partial<TenantTheme>): Promise<boolean> => {
    if (!user?.tenant_id) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.logo_url !== undefined) updateData.logo_url = updates.logo_url;
      if (updates.primary_color !== undefined) updateData.primary_color = updates.primary_color;
      if (updates.secondary_color !== undefined) updateData.secondary_color = updates.secondary_color;

      const { error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', user.tenant_id);

      if (error) throw error;

      const newTheme = { ...theme, ...updates };
      setTheme(newTheme);
      applyThemeColors(newTheme.primary_color, newTheme.secondary_color);
      
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      return false;
    }
  };

  const refreshTheme = async () => {
    await fetchTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, isLoading, updateTheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
