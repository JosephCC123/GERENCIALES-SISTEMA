import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  User, 
  Calendar, 
  Globe, 
  Search 
} from 'lucide-react';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

interface Visitor {
  id: number;
  full_name: string;
  document_number: string;
  nationality: string;
  visitor_type: string;
  site?: { name: string };
}

interface Site {
  id: number;
  name: string;
}

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    document_number: '',
    visitor_type: 'nacional',
    nationality: 'Perú',
    site_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    entry_time: new Date().toLocaleTimeString('es-PE', { hour12: false }).substring(0, 5),
    ticket_number: ''
  });

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/visitors');
      setVisitors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/tourist-sites');
      setSites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchSites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/visitors', formData);
      setIsModalOpen(false);
      setFormData({
        full_name: '',
        document_number: '',
        visitor_type: 'nacional',
        nationality: 'Perú',
        site_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        entry_time: new Date().toLocaleTimeString('es-PE', { hour12: false }).substring(0, 5),
        ticket_number: ''
      });
      fetchVisitors();
    } catch (error) {
      console.error('Error creating visitor:', error);
      alert('Error al registrar visitante');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Registro de Visitantes" 
        description="Listado y control de ingresos a los sitios turísticos."
        buttonLabel="Registrar Entrada"
        onButtonClick={() => setIsModalOpen(true)}
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
                [1, 2, 3, 4, 5].map(i => (
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nuevo Visitante"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input 
                id="full_name" 
                required 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_number">N° Documento</Label>
              <Input 
                id="document_number" 
                required 
                value={formData.document_number}
                onChange={e => setFormData({...formData, document_number: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitor_type">Tipo de Visitante</Label>
              <select 
                id="visitor_type"
                className="w-full bg-card border border-border rounded-lg p-2 text-sm"
                value={formData.visitor_type}
                onChange={e => setFormData({...formData, visitor_type: e.target.value})}
              >
                <option value="nacional">Nacional</option>
                <option value="extranjero">Extranjero</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidad</Label>
              <Input 
                id="nationality" 
                required 
                value={formData.nationality}
                onChange={e => setFormData({...formData, nationality: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_id">Punto de Ingreso</Label>
            <select 
              id="site_id"
              required
              className="w-full bg-card border border-border rounded-lg p-2 text-sm"
              value={formData.site_id}
              onChange={e => setFormData({...formData, site_id: e.target.value})}
            >
              <option value="">Seleccione un sitio...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Fecha</Label>
              <Input 
                id="entry_date" 
                type="date" 
                required 
                value={formData.entry_date}
                onChange={e => setFormData({...formData, entry_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_time">Hora</Label>
              <Input 
                id="entry_time" 
                type="time" 
                required 
                value={formData.entry_time}
                onChange={e => setFormData({...formData, entry_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket_number">N° Ticket / Boleto</Label>
            <Input 
              id="ticket_number" 
              value={formData.ticket_number}
              onChange={e => setFormData({...formData, ticket_number: e.target.value})}
            />
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
              {submitting ? 'Registrando...' : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
