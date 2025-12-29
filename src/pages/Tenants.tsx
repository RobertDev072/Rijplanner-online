import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Plus, 
  Users, 
  BookOpen, 
  Trash2, 
  Loader2, 
  Copy, 
  Check,
  Sparkles,
  KeyRound,
  User,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Tenant } from '@/types';
import { cn } from '@/lib/utils';

interface TenantStats {
  tenant: Tenant;
  userCount: number;
  lessonCount: number;
}

interface NewTenantCredentials {
  tenantName: string;
  username: string;
  pincode: string;
}

export default function Tenants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<NewTenantCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchTenants();
  }, [user, navigate]);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      const stats: TenantStats[] = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          const { count: lessonCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          return {
            tenant: {
              id: tenant.id,
              name: tenant.name,
              created_at: tenant.created_at,
            },
            userCount: userCount || 0,
            lessonCount: lessonCount || 0,
          };
        })
      );

      setTenants(stats);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Fout bij ophalen rijscholen');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePincode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) {
      toast.error('Vul een naam in');
      return;
    }

    setIsSubmitting(true);
    const pincode = generatePincode();
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({ name: newTenantName.trim() })
        .select()
        .single();

      if (error) throw error;

      // Create default admin user for the new tenant
      const { error: userError } = await supabase
        .from('users')
        .insert({
          tenant_id: data.id,
          username: 'admin',
          pincode: pincode,
          role: 'admin',
          name: `Beheerder ${newTenantName.trim()}`,
        });

      if (userError) throw userError;

      // Show credentials
      setNewCredentials({
        tenantName: newTenantName.trim(),
        username: 'admin',
        pincode: pincode,
      });

      setNewTenantName('');
      setShowAddForm(false);
      fetchTenants();
      
      toast.success('Rijschool aangemaakt!');
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast.error('Fout bij aanmaken rijschool');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Weet je zeker dat je "${tenantName}" wilt verwijderen? Alle gebruikers en lessen worden ook verwijderd.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      toast.success(`Rijschool "${tenantName}" verwijderd`);
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Fout bij verwijderen rijschool');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Gekopieerd!');
  };

  if (user?.role !== 'superadmin') return null;

  return (
    <MobileLayout title="Rijscholen">

      <div className="space-y-4">
        {/* New Credentials Modal */}
        {newCredentials && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-success animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Rijschool aangemaakt!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  "{newCredentials.tenantName}"
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Gebruikersnaam
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg">{newCredentials.username}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(newCredentials.username, 'username')}
                    >
                      {copiedField === 'username' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Pincode
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-2xl tracking-widest">{newCredentials.pincode}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(newCredentials.pincode, 'pincode')}
                    >
                      {copiedField === 'pincode' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mb-4">
                Bewaar deze gegevens! De admin kan hiermee inloggen en instructeurs aanmaken.
              </p>

              <Button 
                className="w-full" 
                onClick={() => setNewCredentials(null)}
              >
                <Check className="w-4 h-4" />
                Begrepen
              </Button>
            </div>
          </div>
        )}

        {/* Marketing Gallery Button */}
        <Button
          onClick={() => navigate('/marketing')}
          variant="outline"
          className="w-full h-14 text-base gap-3 border-primary/30 hover:bg-primary/5 transition-all duration-300"
          size="lg"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          Marketing Gallery & Demo
          <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
        </Button>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full h-14 text-base gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          Nieuwe rijschool toevoegen
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddTenant} className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Nieuwe rijschool</h3>
                <p className="text-xs text-muted-foreground">Er wordt automatisch een admin aangemaakt</p>
              </div>
            </div>
            
            <Input
              placeholder="Naam van de rijschool"
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              className="h-12"
            />
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 h-12"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isSubmitting ? 'Aanmaken...' : 'Aanmaken'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="h-12"
              >
                Annuleren
              </Button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-muted-foreground">Rijscholen laden...</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Geen rijscholen</h3>
            <p className="text-sm text-muted-foreground">Maak je eerste rijschool aan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map(({ tenant, userCount, lessonCount }, index) => (
              <div
                key={tenant.id}
                className={cn(
                  "glass-card rounded-2xl p-5 animate-slide-up hover:border-primary/50 transition-all duration-300",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{tenant.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Aangemaakt op {new Date(tenant.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{userCount}</span>
                        <span className="text-xs text-muted-foreground">gebruikers</span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <BookOpen className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">{lessonCount}</span>
                        <span className="text-xs text-muted-foreground">lessen</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card rounded-2xl p-5 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Hoe werkt het?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Je maakt een rijschool aan → Admin wordt gemaakt</li>
                <li>2. Admin logt in → Maakt instructeurs aan</li>
                <li>3. Instructeur logt in → Plant lessen met leerlingen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
