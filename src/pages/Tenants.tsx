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
  ChevronRight,
  ChevronDown,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Tenant } from '@/types';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TenantStats {
  tenant: Tenant;
  userCount: number;
  lessonCount: number;
  admins: { id: string; name: string; username: string }[];
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
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [resetPincodeUser, setResetPincodeUser] = useState<{ id: string; name: string } | null>(null);
  const [newPincode, setNewPincode] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [deleteTenant, setDeleteTenant] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTenants();
    setIsRefreshing(false);
    toast.success('Data bijgewerkt');
  };

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

          // Fetch admins for this tenant
          const { data: adminsData } = await supabase
            .from('users')
            .select('id, name, username')
            .eq('tenant_id', tenant.id)
            .eq('role', 'admin');

          return {
            tenant: {
              id: tenant.id,
              name: tenant.name,
              created_at: tenant.created_at,
            },
            userCount: userCount || 0,
            lessonCount: lessonCount || 0,
            admins: adminsData || [],
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

  const handleDeleteTenant = async () => {
    if (!deleteTenant || deleteConfirmName !== deleteTenant.name) {
      toast.error('Typ de exacte naam om te bevestigen');
      return;
    }

    setIsDeleting(true);
    try {
      // First delete all related data in order (respecting foreign keys)
      // 1. Delete lesson feedback
      await supabase.from('lesson_feedback').delete().eq('tenant_id', deleteTenant.id);
      
      // 2. Delete lesson progress
      await supabase.from('lesson_progress').delete().eq('tenant_id', deleteTenant.id);
      
      // 3. Delete lessons
      await supabase.from('lessons').delete().eq('tenant_id', deleteTenant.id);
      
      // 4. Delete lesson credits
      await supabase.from('lesson_credits').delete().eq('tenant_id', deleteTenant.id);
      
      // 5. Delete push subscriptions
      await supabase.from('push_subscriptions').delete().eq('tenant_id', deleteTenant.id);
      
      // 6. Delete vehicles
      await supabase.from('vehicles').delete().eq('tenant_id', deleteTenant.id);
      
      // 7. Delete feature flags
      await supabase.from('feature_flags').delete().eq('tenant_id', deleteTenant.id);
      
      // 8. Delete audit logs
      await supabase.from('audit_logs').delete().eq('tenant_id', deleteTenant.id);
      
      // 9. Delete users
      await supabase.from('users').delete().eq('tenant_id', deleteTenant.id);
      
      // 10. Finally delete the tenant
      const { error } = await supabase.from('tenants').delete().eq('id', deleteTenant.id);

      if (error) throw error;

      toast.success(`Rijschool "${deleteTenant.name}" en alle data verwijderd`);
      setDeleteTenant(null);
      setDeleteConfirmName('');
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Fout bij verwijderen rijschool');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPincode = async () => {
    if (!resetPincodeUser || !newPincode || newPincode.length !== 4) {
      toast.error('Pincode moet 4 cijfers zijn');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.rpc('reset_user_pincode', {
        _target_user_id: resetPincodeUser.id,
        _new_pincode: newPincode,
      });

      if (error) throw error;

      toast.success(`Pincode van ${resetPincodeUser.name} is gereset`);
      setResetPincodeUser(null);
      setNewPincode('');
    } catch (error) {
      console.error('Error resetting pincode:', error);
      toast.error('Fout bij resetten pincode');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Gekopieerd!');
  };

  const toggleTenantExpand = (tenantId: string) => {
    setExpandedTenants(prev => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  };

  if (user?.role !== 'superadmin') return null;

  return (
    <MobileLayout title="Rijscholen">

      <div className="space-y-4">
        {/* Reset Pincode Dialog */}
        <AlertDialog open={!!resetPincodeUser} onOpenChange={() => setResetPincodeUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pincode resetten</AlertDialogTitle>
              <AlertDialogDescription>
                Nieuwe pincode voor {resetPincodeUser?.name}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Nieuwe 4-cijferige pincode"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setNewPincode('')}>Annuleren</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetPincode}
                disabled={newPincode.length !== 4 || isResetting}
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Opslaan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Tenant Dialog */}
        <AlertDialog open={!!deleteTenant} onOpenChange={() => { setDeleteTenant(null); setDeleteConfirmName(''); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Rijschool verwijderen
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Je staat op het punt om <strong className="text-foreground">"{deleteTenant?.name}"</strong> permanent te verwijderen.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-destructive mb-2">Dit verwijdert ook:</p>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Alle gebruikers (admins, instructeurs, leerlingen)</li>
                    <li>Alle lessen en lesvoortgang</li>
                    <li>Alle voertuigen</li>
                    <li>Alle feedback en credits</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Typ <strong className="font-mono bg-muted px-1 rounded">{deleteTenant?.name}</strong> om te bevestigen:
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Input
                placeholder="Typ de naam van de rijschool"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="font-mono"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmName('')}>Annuleren</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTenant}
                disabled={deleteConfirmName !== deleteTenant?.name || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanent verwijderen
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        {/* Header with Refresh */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 h-14 text-base gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            Nieuwe rijschool
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="lg"
            className="h-14 w-14 p-0"
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </Button>
        </div>

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
            {tenants.map(({ tenant, userCount, lessonCount, admins }, index) => (
              <Collapsible
                key={tenant.id}
                open={expandedTenants.has(tenant.id)}
                onOpenChange={() => toggleTenantExpand(tenant.id)}
              >
                <div
                  className={cn(
                    "glass-card rounded-2xl animate-slide-up hover:border-primary/50 transition-all duration-300",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-5">
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
                        
                        <div className="flex gap-4 mb-3">
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

                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            {admins.length} beheerder{admins.length !== 1 ? 's' : ''}
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              expandedTenants.has(tenant.id) && "rotate-180"
                            )} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => setDeleteTenant({ id: tenant.id, name: tenant.name })}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t border-border px-5 py-4 bg-muted/30 rounded-b-2xl">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Beheerders
                      </h4>
                      {admins.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Geen beheerders gevonden</p>
                      ) : (
                        <div className="space-y-2">
                          {admins.map((admin) => (
                            <div
                              key={admin.id}
                              className="flex items-center justify-between bg-background/50 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{admin.name}</p>
                                  <p className="text-xs text-muted-foreground">@{admin.username}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setResetPincodeUser({ id: admin.id, name: admin.name })}
                              >
                                <RefreshCw className="w-4 h-4" />
                                Pincode
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
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
