import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, Briefcase, FileCheck, ArrowLeft, Calendar, FileText } from 'lucide-react';
import api from '../lib/api';

interface Operator {
  id: number;
  company_name: string;
  legal_name: string;
  ruc: string;
  license_number: string;
  license_issue_date: string;
  license_expiry_date: string;
  status: string;
}

export function OperatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const response = await api.get(`/tourism-operators/${id}`);
        setOperator(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching operator details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOperator();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Cargando perfil corporativo...</div>;
  }

  if (!operator) {
    return <div className="p-8 text-center text-red-500 font-bold">Operador no encontrado.</div>;
  }

  const isExpired = new Date(operator.license_expiry_date) < new Date();
  const statusColor = operator.status === 'Activo' && !isExpired ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/operators')} className="rounded-full w-10 h-10 p-0 border-border">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
        <PageHeader 
          title={`Expediente: ${operator.company_name}`}
          description={`RUC: ${operator.ruc} - Perfil Corporativo de Agencia de Viajes y Turismo.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 border-border shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Datos de la Empresa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">Razón Social</h3>
              <p className="text-sm font-medium">{operator.legal_name}</p>
            </div>
            <div>
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">Nombre Comercial</h3>
              <p className="text-sm font-medium">{operator.company_name}</p>
            </div>
            <div>
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> RUC
              </h3>
              <p className="text-sm font-medium">{operator.ruc}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-border shadow-sm col-span-1">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-secondary" />
            Licencia DIRCETUR
          </h2>
          
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${statusColor} text-center`}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Estado de Acreditación</h3>
              <p className="text-lg font-extrabold uppercase">{isExpired ? 'VENCIDO' : operator.status}</p>
            </div>

            <div>
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">Constancia N°</h3>
              <p className="text-sm font-medium font-mono bg-muted/50 p-2 rounded">{operator.license_number}</p>
            </div>

            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase">Expedición</span>
              </div>
              <span className="text-sm font-medium">{operator.license_issue_date}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase">Vencimiento</span>
              </div>
              <span className="text-sm font-medium">{operator.license_expiry_date}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
