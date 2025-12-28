import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  BookOpen, 
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tenant, TenantStatus } from '@/types';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalLessons: number;
  lessonsThisWeek: number;
  newUsersThisWeek: number;
}

interface TenantOverview {
  id: string;
  name: string;
  status: TenantStatus;
  userCount: number;
  lessonCount: number;
  created_at: string;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string;
  trend?: string;
  color: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-success text-xs font-medium bg-success/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats>({
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    suspendedTenants: 0,
    totalUsers: 0,
    totalLessons: 0,
    lessonsThisWeek: 0,
    newUsersThisWeek: 0,
  });
  const [topTenants, setTopTenants] = useState<TenantOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchPlatformData();
  }, [user, navigate]);

  const fetchPlatformData = async () => {
    setIsLoading(true);
    try {
      // Fetch tenants with status
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*');
      
      if (tenantsError) throw tenantsError;

      // Count by status
      const tenants = tenantsData || [];
      const activeTenants = tenants.filter(t => t.status === 'active' || !t.status).length;
      const trialTenants = tenants.filter(t => t.status === 'trial').length;
      const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;

      // Fetch all users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch all lessons
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      // Fetch lessons this week
      const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      const { count: lessonsThisWeek } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Fetch new users this week
      const { count: newUsersThisWeek } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      setStats({
        totalTenants: tenants.length,
        activeTenants,
        trialTenants,
        suspendedTenants,
        totalUsers: totalUsers || 0,
        totalLessons: totalLessons || 0,
        lessonsThisWeek: lessonsThisWeek || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
      });

      // Fetch top tenants with user and lesson counts
      const tenantOverviews: TenantOverview[] = await Promise.all(
        tenants.slice(0, 5).map(async (tenant) => {
          const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          const { count: lessonCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          return {
            id: tenant.id,
            name: tenant.name,
            status: (tenant.status as TenantStatus) || 'active',
            userCount: userCount || 0,
            lessonCount: lessonCount || 0,
            created_at: tenant.created_at,
          };
        })
      );

      setTopTenants(tenantOverviews.sort((a, b) => b.lessonCount - a.lessonCount));
    } catch (error) {
      console.error('Error fetching platform data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TenantStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'trial': return <Clock className="w-4 h-4 text-warning" />;
      case 'suspended': return <Pause className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: TenantStatus) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'trial': return 'Proefperiode';
      case 'suspended': return 'Opgeschort';
    }
  };

  if (user?.role !== 'superadmin') return null;

  if (isLoading) {
    return (
      <MobileLayout title="Platform Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Platform Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Superadmin</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Platform Overzicht</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })}
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Building2}
            label="Totaal Rijscholen"
            value={stats.totalTenants}
            color="bg-gradient-to-br from-primary to-primary/70"
          />
          <StatCard
            icon={Users}
            label="Totaal Gebruikers"
            value={stats.totalUsers}
            trend={`+${stats.newUsersThisWeek} deze week`}
            color="bg-gradient-to-br from-accent to-accent/70"
          />
          <StatCard
            icon={BookOpen}
            label="Totaal Lessen"
            value={stats.totalLessons}
            trend={`+${stats.lessonsThisWeek} deze week`}
            color="bg-gradient-to-br from-success to-success/70"
          />
          <StatCard
            icon={Activity}
            label="Actieve Rijscholen"
            value={stats.activeTenants}
            color="bg-gradient-to-br from-warning to-warning/70"
          />
        </div>

        {/* Tenant Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Status Overzicht
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-xl font-bold text-success">{stats.activeTenants}</p>
              <p className="text-xs text-muted-foreground">Actief</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-warning/10">
              <Clock className="w-6 h-6 text-warning mx-auto mb-1" />
              <p className="text-xl font-bold text-warning">{stats.trialTenants}</p>
              <p className="text-xs text-muted-foreground">Proef</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-destructive/10">
              <Pause className="w-6 h-6 text-destructive mx-auto mb-1" />
              <p className="text-xl font-bold text-destructive">{stats.suspendedTenants}</p>
              <p className="text-xs text-muted-foreground">Opgeschort</p>
            </div>
          </div>
        </motion.div>

        {/* Top Tenants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top Rijscholen
          </h3>
          <div className="space-y-2">
            {topTenants.map((tenant, index) => (
              <div
                key={tenant.id}
                className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/admin/tenants`)}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{tenant.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getStatusIcon(tenant.status)}
                    <span>{getStatusLabel(tenant.status)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{tenant.lessonCount}</p>
                  <p className="text-xs text-muted-foreground">lessen</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground mb-3">Snelle Acties</h3>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate('/tenants')}
            >
              <Building2 className="w-6 h-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Rijscholen</p>
              <p className="text-xs text-muted-foreground">Beheer alle rijscholen</p>
            </div>
            <div
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-6 h-6 text-accent mb-2" />
              <p className="font-medium text-foreground">Gebruikers</p>
              <p className="text-xs text-muted-foreground">Bekijk alle gebruikers</p>
            </div>
            <div
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate('/admin/audit-logs')}
            >
              <FileText className="w-6 h-6 text-warning mb-2" />
              <p className="font-medium text-foreground">Audit Logs</p>
              <p className="text-xs text-muted-foreground">Bekijk acties</p>
            </div>
            <div
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate('/admin/feature-flags')}
            >
              <AlertTriangle className="w-6 h-6 text-success mb-2" />
              <p className="font-medium text-foreground">Feature Flags</p>
              <p className="text-xs text-muted-foreground">Beheer features</p>
            </div>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
