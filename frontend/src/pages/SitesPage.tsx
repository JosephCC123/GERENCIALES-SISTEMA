import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  MapPin, 
  Users, 
  ShieldCheck, 
  MoreVertical 
} from 'lucide-react';
import axios from 'axios';

interface TouristSite {
  id: number;
  name: string;
  category: string;
  location: string;
  capacity: number;
  managing_entity?: { name: string };
}

export function SitesPage() {
  const [sites, setSites] = useState<TouristSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/tourist-sites', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        setSites(response.data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Sitios Turísticos" 
        description="Gestión y monitoreo de atractivos culturales y naturales."
        buttonLabel="Nuevo Sitio"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="p-6 hover:shadow-lg transition-shadow border-border overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4">
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{site.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                    {site.category}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Capacidad: <b className="text-foreground">{site.capacity}</b> personas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entidad: {site.managing_entity?.name || 'MINCUL'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-1 rounded bg-secondary/10 text-secondary">
                  OPERATIVO
                </span>
                <button className="text-primary text-sm font-bold hover:underline">
                  Ver Detalles
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
