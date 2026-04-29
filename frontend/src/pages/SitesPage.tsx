import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  MapPin, 
  Users, 
  ShieldCheck, 
  MoreVertical 
} from 'lucide-react';
import api from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface TouristSite {
  id: number;
  name: string;
  category: string;
  location: string;
  capacity_standard: number;
  admin_entity: string;
}

export function SitesPage() {
  const [sites, setSites] = useState<TouristSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Archaeological',
    location: '',
    capacity: 1000,
    status: 'active'
  });

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tourist-sites');
      setSites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tourist-sites', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'Archaeological',
        location: '',
        capacity: 1000,
        status: 'active'
      });
      fetchSites();
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Error al crear sitio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Sitios Turísticos" 
        description="Gestión y monitoreo de atractivos culturales y naturales."
        buttonLabel="Nuevo Sitio"
        onButtonClick={() => setIsModalOpen(true)}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
                  <span>Capacidad: <b className="text-foreground">{site.capacity_standard}</b> personas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entidad: {site.admin_entity}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-1 rounded bg-secondary/10 text-secondary uppercase">
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Añadir Nuevo Sitio Turístico"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Atractivo</Label>
            <Input 
              id="name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ej. Sacsayhuaman"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Categoría</Label>
              <select 
                id="type"
                className="w-full bg-card border border-border rounded-lg p-2 text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Archaeological">Arqueológico</option>
                <option value="Natural">Natural</option>
                <option value="Cultural">Cultural</option>
                <option value="Museum">Museo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación / Distrito</Label>
              <Input 
                id="location" 
                required 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Ej. Cusco"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad de Carga</Label>
              <Input 
                id="capacity" 
                type="number" 
                required 
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado Inicial</Label>
              <select 
                id="status"
                className="w-full bg-card border border-border rounded-lg p-2 text-sm"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Operativo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="closed">Cerrado Temporalmente</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Crear Sitio'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
