import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText,
  User,
  Building2,
  Settings,
  ToggleLeft,
  Trash2,
  Edit,
  UserPlus,
  LogIn,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditLog } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const ACTION_ICONS: Record<string, React.ElementType> = {
  'update_tenant': Settings,
  'enable_feature': ToggleLeft,
  'disable_feature': ToggleLeft,
  'delete_tenant': Trash2,
  'create_tenant': Building2,
  'update_user': Edit,
  'delete_user': Trash2,
  'create_user': UserPlus,
  'impersonate_user': LogIn,
  'end_impersonation': LogIn,
};

const ACTION_LABELS: Record<string, string> = {
  'update_tenant': 'Rijschool bijgewerkt',
  'enable_feature': 'Feature ingeschakeld',
  'disable_feature': 'Feature uitgeschakeld',
  'delete_tenant': 'Rijschool verwijderd',
  'create_tenant': 'Rijschool aangemaakt',
  'update_user': 'Gebruiker bijgewerkt',
  'delete_user': 'Gebruiker verwijderd',
  'create_user': 'Gebruiker aangemaakt',
  'impersonate_user': 'Ingelogd als gebruiker',
  'end_impersonation': 'Impersonatie beëindigd',
};

export default function AuditLogs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchLogs();
  }, [user, navigate]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data || []) as AuditLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || FileText;
    return Icon;
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'text-destructive bg-destructive/10';
    if (action.includes('enable')) return 'text-success bg-success/10';
    if (action.includes('disable')) return 'text-warning bg-warning/10';
    if (action.includes('impersonate')) return 'text-primary bg-primary/10';
    return 'text-muted-foreground bg-muted/50';
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  if (user?.role !== 'superadmin') return null;

  if (isLoading) {
    return (
      <MobileLayout title="Audit Logs">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Audit Logs">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoeken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle acties</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {getActionLabel(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {filteredLogs.map((log, index) => {
            const Icon = getActionIcon(log.action);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getActionColor(log.action))}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      {getActionLabel(log.action)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Door <span className="font-medium">{log.actor_name}</span>
                      {log.target_name && (
                        <> • <span className="font-medium">{log.target_name}</span></>
                      )}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'HH:mm', { locale: nl })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'd MMM', { locale: nl })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Geen logs gevonden</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
