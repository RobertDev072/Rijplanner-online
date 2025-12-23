import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Users, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tenant } from '@/types';

interface TenantStats {
  tenant: Tenant;
  userCount: number;
  lessonCount: number;
}

export default function Tenants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) {
      toast.error('Vul een naam in');
      return;
    }

    setIsSubmitting(true);
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
          pincode: '1234',
          role: 'admin',
          name: 'Beheerder',
        });

      if (userError) throw userError;

      toast.success(`Rijschool "${newTenantName}" aangemaakt met standaard admin (admin/1234)`);
      setNewTenantName('');
      setShowAddForm(false);
      fetchTenants();
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

  if (user?.role !== 'superadmin') return null;

  return (
    <div className="page-container">
      <Header title="Rijscholen beheren" />

      <div className="space-y-4">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Nieuwe rijschool toevoegen
        </Button>

        {showAddForm && (
          <form onSubmit={handleAddTenant} className="glass-card rounded-xl p-4 space-y-4">
            <Input
              placeholder="Naam rijschool"
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Bezig...' : 'Aanmaken'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Annuleren
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Geen rijscholen gevonden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map(({ tenant, userCount, lessonCount }) => (
              <div
                key={tenant.id}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {userCount} gebruikers
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {lessonCount} lessen
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
