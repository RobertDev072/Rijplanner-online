import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Settings,
  CheckCircle,
  Clock,
  Pause,
  Save,
  X,
  Loader2,
  ToggleLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Tenant, TenantStatus, FeatureFlag, AVAILABLE_FEATURES } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TenantWithStats extends Tenant {
  userCount: number;
  lessonCount: number;
  features: FeatureFlag[];
}

export default function TenantManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'active' as TenantStatus,
    user_limit: 50,
  });

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

      const tenantsWithStats: TenantWithStats[] = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          const { count: lessonCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          const { data: features } = await supabase
            .from('feature_flags')
            .select('*')
            .eq('tenant_id', tenant.id);

          return {
            id: tenant.id,
            name: tenant.name,
            status: (tenant.status as TenantStatus) || 'active',
            user_limit: tenant.user_limit || 50,
            trial_ends_at: tenant.trial_ends_at,
            logo_url: tenant.logo_url,
            primary_color: tenant.primary_color,
            secondary_color: tenant.secondary_color,
            whatsapp_number: tenant.whatsapp_number,
            created_at: tenant.created_at,
            updated_at: tenant.updated_at,
            userCount: userCount || 0,
            lessonCount: lessonCount || 0,
            features: features || [],
          };
        })
      );

      setTenants(tenantsWithStats);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Fout bij ophalen rijscholen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTenant = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setEditForm({
      status: tenant.status,
      user_limit: tenant.user_limit,
    });
  };

  const handleSave = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: editForm.status,
          user_limit: editForm.user_limit,
        })
        .eq('id', selectedTenant.id);

      if (error) throw error;

      // Log the action
      await supabase.from('audit_logs').insert({
        actor_id: user!.id,
        actor_name: user!.name,
        action: 'update_tenant',
        target_type: 'tenant',
        target_id: selectedTenant.id,
        target_name: selectedTenant.name,
        details: {
          old_status: selectedTenant.status,
          new_status: editForm.status,
          old_user_limit: selectedTenant.user_limit,
          new_user_limit: editForm.user_limit,
        },
      });

      toast.success('Rijschool bijgewerkt');
      setSelectedTenant(null);
      fetchTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error('Fout bij bijwerken rijschool');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureToggle = async (tenantId: string, featureKey: string, enabled: boolean) => {
    try {
      // Check if feature flag exists
      const { data: existing } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('feature_key', featureKey)
        .single();

      if (existing) {
        await supabase
          .from('feature_flags')
          .update({ enabled })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('feature_flags')
          .insert({
            tenant_id: tenantId,
            feature_key: featureKey,
            enabled,
          });
      }

      // Log the action
      await supabase.from('audit_logs').insert({
        actor_id: user!.id,
        actor_name: user!.name,
        action: enabled ? 'enable_feature' : 'disable_feature',
        target_type: 'feature_flag',
        target_id: tenantId,
        target_name: featureKey,
        tenant_id: tenantId,
      });

      toast.success(`Feature ${enabled ? 'ingeschakeld' : 'uitgeschakeld'}`);
      fetchTenants();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Fout bij wijzigen feature');
    }
  };

  const getStatusIcon = (status: TenantStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'trial': return <Clock className="w-4 h-4 text-warning" />;
      case 'suspended': return <Pause className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'trial': return 'bg-warning/10 text-warning';
      case 'suspended': return 'bg-destructive/10 text-destructive';
    }
  };

  const isFeatureEnabled = (tenant: TenantWithStats, featureKey: string) => {
    const feature = tenant.features.find(f => f.feature_key === featureKey);
    return feature?.enabled || false;
  };

  if (user?.role !== 'superadmin') return null;

  if (isLoading) {
    return (
      <MobileLayout title="Tenant Beheer">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Tenant Beheer">
      <div className="space-y-4">
        {/* Selected Tenant Modal */}
        {selectedTenant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedTenant.name}</h3>
                    <p className="text-xs text-muted-foreground">Tenant beheren</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedTenant(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 space-y-6">
                {/* Status & Limits */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Instellingen
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                      <Select 
                        value={editForm.status} 
                        onValueChange={(value: TenantStatus) => setEditForm({ ...editForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              Actief
                            </div>
                          </SelectItem>
                          <SelectItem value="trial">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-warning" />
                              Proefperiode
                            </div>
                          </SelectItem>
                          <SelectItem value="suspended">
                            <div className="flex items-center gap-2">
                              <Pause className="w-4 h-4 text-destructive" />
                              Opgeschort
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Gebruikerslimiet</label>
                      <Input
                        type="number"
                        value={editForm.user_limit}
                        onChange={(e) => setEditForm({ ...editForm, user_limit: parseInt(e.target.value) || 50 })}
                        min={1}
                        max={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Huidig: {selectedTenant.userCount} gebruikers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-primary" />
                    Feature Flags
                  </h4>
                  
                  <div className="space-y-3">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div 
                        key={feature.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                          checked={isFeatureEnabled(selectedTenant, feature.key)}
                          onCheckedChange={(checked) => 
                            handleFeatureToggle(selectedTenant.id, feature.key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tenants List */}
        <div className="space-y-3">
          {tenants.map((tenant, index) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleSelectTenant(tenant)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">{tenant.name}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(tenant.status))}>
                      {tenant.status === 'active' ? 'Actief' : tenant.status === 'trial' ? 'Proef' : 'Opgeschort'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{tenant.userCount}/{tenant.user_limit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{tenant.lessonCount} lessen</span>
                    </div>
                  </div>
                </div>

                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>

        {tenants.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Geen rijscholen gevonden</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
