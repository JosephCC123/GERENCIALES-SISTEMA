import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink 
} from 'lucide-react';
import api from '../lib/api';

interface Operator {
  id: number;
  business_name: string;
  ruc: string;
  email: string;
  phone: string;
  operator_type: string;
}

export function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await api.get('/tourism-operators');
        setOperators(response.data.data || []);
      } catch (error) {
        console.error('Error fetching operators:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Operadores Turísticos" 
        description="Directorio de agencias y operadores certificados."
        buttonLabel="Nuevo Operador"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)
        ) : (
          operators.map((op) => (
            <Card key={op.id} className="p-6 border-border group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{op.business_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{op.operator_type}</p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{op.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{op.phone}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">RUC: {op.ruc}</span>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] font-bold text-green-600 uppercase">Activo</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
