import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search,
  LogIn,
  X,
  Building2,
  User as UserIcon,
  GraduationCap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { User, Tenant } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  createImpersonationToken, 
  storeImpersonationToken, 
  getImpersonationToken,
  isImpersonationTokenValid
} from '@/utils/securityTokens';

interface UserWithTenant extends User {
  tenant?: Tenant;
}

export default function ImpersonateUser() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [users, setUsers] = useState<UserWithTenant[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [hasActiveImpersonation, setHasActiveImpersonation] = useState(false);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    
    // Check for existing valid impersonation token
    const existingToken = getImpersonationToken();
    setHasActiveImpersonation(isImpersonationTokenValid(existingToken));
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all tenants
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*');
      
      setTenants((tenantsData || []).map(t => ({
        id: t.id,
        name: t.name,
        status: t.status || 'active',
        user_limit: t.user_limit || 50,
        trial_ends_at: t.trial_ends_at,
        logo_url: t.logo_url,
        primary_color: t.primary_color,
        secondary_color: t.secondary_color,
        whatsapp_number: t.whatsapp_number,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })));

      // Fetch all users (excluding superadmins)
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'superadmin')
        .order('name');

      const usersWithTenants: UserWithTenant[] = (usersData || []).map(u => ({
        id: u.id,
        tenant_id: u.tenant_id,
        username: u.username,
        pincode: u.pincode,
        role: u.role as User['role'],
        name: u.name,
        avatar_url: u.avatar_url,
        email: u.email,
        phone: u.phone,
        address: u.address,
        theory_passed: u.theory_passed,
        theory_passed_at: u.theory_passed_at,
        created_at: u.created_at,
        tenant: (tenantsData || []).find(t => t.id === u.tenant_id) as Tenant | undefined,
      }));

      setUsers(usersWithTenants);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonate = async (targetUser: UserWithTenant) => {
    if (!user) return;
    
    setIsImpersonating(true);
    try {
      // Create secure impersonation token (without storing pincode)
      const token = createImpersonationToken(
        user.id,
        user.username,
        user.name
      );
      storeImpersonationToken(token);
      
      // Log the impersonation
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_name: user.name,
        action: 'impersonate_user',
        target_type: 'user',
        target_id: targetUser.id,
        target_name: targetUser.name,
        tenant_id: targetUser.tenant_id,
        details: {
          target_role: targetUser.role,
          target_tenant: targetUser.tenant?.name,
          session_token: token.sessionToken.substring(0, 8) + '...', // Only log partial token for audit
        },
      });

      // Create impersonation session in database
      await supabase.from('impersonation_sessions').insert({
        superadmin_id: user.id,
        impersonated_user_id: targetUser.id,
        is_active: true,
      });

      // Login as the target user
      const success = await login(targetUser.username, targetUser.pincode);
      
      if (success) {
        toast.success(`Ingelogd als ${targetUser.name}`);
        navigate('/dashboard');
      } else {
        toast.error('Kon niet inloggen als gebruiker');
        // Clear token on failure
        localStorage.removeItem('impersonation_token');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      toast.error('Fout bij impersonatie');
      localStorage.removeItem('impersonation_token');
    } finally {
      setIsImpersonating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.tenant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'instructor': return UserIcon;
      case 'student': return GraduationCap;
      default: return UserIcon;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Beheerder';
      case 'instructor': return 'Instructeur';
      case 'student': return 'Leerling';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-primary bg-primary/10';
      case 'instructor': return 'text-accent bg-accent/10';
      case 'student': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (user?.role !== 'superadmin') return null;

  if (isLoading) {
    return (
      <MobileLayout title="Impersonatie">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Inloggen als Gebruiker">
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="glass-card p-4 border-warning/50 bg-warning/5">
          <div className="flex items-start gap-3">
            <LogIn className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Impersonatie Modus</p>
              <p className="text-xs text-muted-foreground mt-1">
                Je kunt inloggen als elke gebruiker. Alle acties worden gelogd voor audit doeleinden.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam, username of rijschool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.map((targetUser, index) => {
            const RoleIcon = getRoleIcon(targetUser.role);
            return (
              <motion.div
                key={targetUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    {targetUser.avatar_url ? (
                      <img 
                        src={targetUser.avatar_url} 
                        alt={targetUser.name} 
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{targetUser.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("px-1.5 py-0.5 rounded-md font-medium", getRoleColor(targetUser.role))}>
                        {getRoleLabel(targetUser.role)}
                      </span>
                      {targetUser.tenant && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {targetUser.tenant.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImpersonate(targetUser)}
                    disabled={isImpersonating}
                    className="shrink-0"
                  >
                    <LogIn className="w-4 h-4" />
                    Inloggen
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Geen gebruikers gevonden</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
