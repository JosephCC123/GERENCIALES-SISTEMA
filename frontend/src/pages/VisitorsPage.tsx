import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  User, 
  Calendar, 
  Globe, 
  Search 
} from 'lucide-react';
import axios from 'axios';
import { Input } from '../components/ui/input';

interface Visitor {
  id: number;
  full_name: string;
  document_number: string;
  nationality: string;
  visitor_type: string;
  site?: { name: string };
}

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/visitors', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        setVisitors(response.data.data || []);
      } catch (error) {
        console.error('Error fetching visitors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Registro de Visitantes" 
        description="Listado y control de ingresos a los sitios turísticos."
        buttonLabel="Registrar Entrada"
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o documento..." className="pl-10 rounded-full bg-card" />
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Visitante</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nacionalidad</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 h-4 bg-muted/20" />
                  </tr>
                ))
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No hay visitantes registrados hoy.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{visitor.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{visitor.document_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-3 h-3 text-secondary" />
                        {visitor.nationality}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        visitor.visitor_type === 'extranjero' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {visitor.visitor_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{visitor.site?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button className="text-primary text-xs font-bold hover:underline">Gestionar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
