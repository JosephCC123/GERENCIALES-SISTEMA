import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  ShieldCheck, 
  User, 
  Clock, 
  FileJson,
  AlertCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import api from '../lib/api';

interface AuditLog {
  id: number;
  user_id: number;
  user?: { name: string };
  action: string;
  table_name: string;
  record_id: number;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs');
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'update': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'delete': return 'text-red-600 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Bitácora de Auditoría" 
        description="Registro histórico de todas las acciones y modificaciones realizadas en el sistema."
      />

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted/20" />)
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-muted/20">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground italic">No se han registrado eventos de auditoría todavía.</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-6 border-border hover:border-primary/20 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${getActionColor(log.action)}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {log.table_name} <span className="text-muted-foreground font-normal">#ID: {log.record_id}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground/80">
                        <User className="w-3 h-3" /> {log.user?.name || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                      </span>
                      <span className="font-mono opacity-60">IP: {log.ip_address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-lg h-9 gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <FileJson className="w-4 h-4" /> Ver Detalles
                   </Button>
                </div>
              </div>
              
              {/* Optional values comparison placeholder */}
              {log.action === 'update' && (
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                   <div className="bg-red-500/5 p-2 rounded flex-1 line-clamp-1 italic">Viejos valores...</div>
                   <ArrowRight className="w-4 h-4 shrink-0" />
                   <div className="bg-green-500/5 p-2 rounded flex-1 line-clamp-1 italic">Nuevos valores...</div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex items-center gap-6">
        <div className="bg-primary p-4 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
           <AlertCircle className="w-8 h-8" />
        </div>
        <div>
           <h4 className="font-bold text-lg mb-1">Política de Retención</h4>
           <p className="text-sm text-muted-foreground max-w-2xl">
              De acuerdo con las normativas SIG, los logs de auditoría se conservan de forma inmutable por un periodo de 2 años. Solo los administradores de nivel superior tienen acceso a esta sección.
           </p>
        </div>
      </div>
    </div>
  );
}
