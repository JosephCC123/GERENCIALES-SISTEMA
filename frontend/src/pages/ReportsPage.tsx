import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  MapPin, 
  Building2, 
  BookOpen,
  Filter
} from 'lucide-react';
import api from '../lib/api';

export function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportData = async (entity: string) => {
    setLoading(entity);
    try {
      const response = await api.get(`/${entity}`);
      const data = response.data.data || response.data;
      
      if (!data || data.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      // Dynamic CSV generation with UTF-8 BOM for Excel compatibility
      const headers = Object.keys(data[0]);
      const csvContent = "\uFEFF" 
        + headers.join(",") + "\n" 
        + data.map((row: any) => headers.map(h => row[h]).join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_${entity}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error exporting ${entity}:`, error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(null);
    }
  };

  const reportModules = [
    {
      id: 'visitors',
      title: 'Reporte de Visitantes',
      description: 'Listado completo de ingresos, nacionalidades y flujos por sitio.',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      id: 'tourist-sites',
      title: 'Catálogo de Sitios',
      description: 'Detalle técnico de atractivos, capacidades de carga y estados.',
      icon: MapPin,
      color: 'bg-green-500/10 text-green-600'
    },
    {
      id: 'tourism-operators',
      title: 'Operadores Turísticos',
      description: 'Directorio de agencias, RUCs y estados de licencias vigentes.',
      icon: Building2,
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      id: 'certified-guides',
      title: 'Guías Certificados',
      description: 'Padrón de guías autorizados, idiomas y especialidades.',
      icon: BookOpen,
      color: 'bg-orange-500/10 text-orange-600'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Centro de Reportes" 
        description="Generación y descarga de informes gerenciales en formato CSV."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportModules.map((module) => (
          <Card key={module.id} className="p-8 border-border hover:border-primary/40 transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${module.color}`}>
                <module.icon className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                 <span className="text-[10px] font-bold px-2 py-1 rounded bg-muted border border-border">CSV</span>
                 <span className="text-[10px] font-bold px-2 py-1 rounded bg-muted border border-border uppercase">v1.0</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {module.description}
            </p>

            <div className="flex gap-3">
              <Button 
                onClick={() => exportData(module.id)}
                disabled={loading === module.id}
                className="flex-1 rounded-xl h-12 gap-2 font-bold shadow-lg shadow-primary/20"
              >
                {loading === module.id ? (
                  'Generando...'
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar CSV
                  </>
                )}
              </Button>
              <Button variant="outline" className="rounded-xl h-12 w-12 p-0 border-border">
                <Filter className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 border-border bg-muted/30 border-dashed text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="font-bold text-lg mb-2">Reportes PDF Personalizados</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Próximamente podrá generar informes en PDF con membrete institucional y gráficos comparativos automáticos.
        </p>
      </Card>
    </div>
  );
}
