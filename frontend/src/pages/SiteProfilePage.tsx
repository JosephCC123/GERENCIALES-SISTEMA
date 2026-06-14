import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

interface TouristSite {
  id: number;
  name: string;
  location: string;
  capacity_standard: number;
  status: string;
  description: string;
}

export function SiteProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<TouristSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await api.get(`/tourist-sites/${id}`);
        setSite(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching site details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Cargando perfil...</div>;
  }

  if (!site) {
    return <div className="p-8 text-center text-red-500 font-bold">Sitio no encontrado.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/sites')} className="rounded-full w-10 h-10 p-0 border-border">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
        <PageHeader 
          title={`Perfil del Sitio: ${site.name}`}
          description={`Detalles operativos y estado actual del recurso turístico.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 border-border shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4">Información General</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Ubicación</h3>
                <p className="text-lg font-medium">{site.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Aforo Permitido (Estándar)</h3>
                <p className="text-lg font-medium">{site.capacity_standard} personas simultáneas</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-border shadow-sm col-span-1">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4">Estado Operativo</h2>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {site.status === 'Operativo' ? (
              <>
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border-4 border-green-500/20">
                  <MapPin className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-green-500 tracking-tight uppercase">OPERATIVO</h3>
                <p className="text-sm text-muted-foreground mt-2">Condiciones óptimas para visitas.</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border-4 border-red-500/20 animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-red-500 tracking-tight uppercase">CERRADO</h3>
                <p className="text-sm text-muted-foreground mt-2">Mantenimiento o restricciones climáticas.</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
