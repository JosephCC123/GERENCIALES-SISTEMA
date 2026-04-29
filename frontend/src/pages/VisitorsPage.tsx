import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  User, 
  Calendar, 
  Globe, 
  Search,
  Trash2,
  Edit2
} from 'lucide-react';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { debounce } from 'lodash';

interface Visitor {
  id: number;
  full_name: string;
  document_number: string;
  nationality: string;
  visitor_type: string;
  entry_date: string;
  entry_time: string;
  ticket_number: string;
  site_id: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  
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

  const fetchVisitors = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/visitors?search=${search}`);
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

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => fetchVisitors(term), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
    try {
      await api.delete(`/visitors/${id}`);
      setVisitors(visitors.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting visitor:', error);
      alert('Error al eliminar registro');
    }
  };

  const handleEdit = (visitor: Visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      full_name: visitor.full_name,
      document_number: visitor.document_number,
      visitor_type: visitor.visitor_type,
      nationality: visitor.nationality,
      site_id: visitor.site_id.toString(),
      entry_date: visitor.entry_date,
      entry_time: visitor.entry_time.substring(0, 5),
      ticket_number: visitor.ticket_number || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVisitor) {
        await api.put(`/visitors/${editingVisitor.id}`, formData);
      } else {
        await api.post('/visitors', formData);
      }
      setIsModalOpen(false);
      setEditingVisitor(null);
      resetForm();
      fetchVisitors(searchTerm);
    } catch (error) {
      console.error('Error saving visitor:', error);
      alert('Error al guardar registro');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
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
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Registro de Visitantes" 
        description="Listado y control de ingresos a los sitios turísticos."
        buttonLabel="Registrar Entrada"
        onButtonClick={() => {
          setEditingVisitor(null);
          resetForm();
          setIsModalOpen(true);
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o documento..." 
            className="pl-10 rounded-full bg-card h-12 shadow-sm border-border focus:ring-primary" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          variant="outline" 
          className="rounded-full flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold"
          onClick={() => {
            const headers = ['Nombre', 'Documento', 'Nacionalidad', 'Tipo', 'Sitio'];
            const rows = visitors.map(v => [v.full_name, v.document_number, v.nationality, v.visitor_type, v.site?.name || 'N/A']);
            const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `visitantes_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Exportar Reporte CSV
        </Button>
      </div>

      <Card className="border-border overflow-hidden shadow-xl rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visitante</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Documento</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nacionalidad</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ubicación</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acciones</th>
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
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic">
                    No se encontraron visitantes con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{visitor.full_name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{visitor.entry_date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{visitor.document_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-secondary" />
                        <span className="font-medium">{visitor.nationality}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${
                        visitor.visitor_type === 'extranjero' 
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                        : 'bg-green-500/10 text-green-600 border-green-500/20'
                      }`}>
                        {visitor.visitor_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <span className="text-sm font-bold text-foreground">{visitor.site?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:bg-primary/10 rounded-xl"
                          onClick={() => handleEdit(visitor)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleDelete(visitor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
        title={editingVisitor ? "Editar Registro de Visitante" : "Registrar Nuevo Visitante"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</Label>
              <Input 
                id="full_name" 
                required 
                className="rounded-xl border-border h-11"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">N° Documento</Label>
              <Input 
                id="document_number" 
                required 
                className="rounded-xl border-border h-11"
                value={formData.document_number}
                onChange={e => setFormData({...formData, document_number: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="visitor_type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Visitante</Label>
              <select 
                id="visitor_type"
                className="w-full bg-card border border-border rounded-xl h-11 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.visitor_type}
                onChange={e => setFormData({...formData, visitor_type: e.target.value})}
              >
                <option value="nacional">Nacional (Local/País)</option>
                <option value="extranjero">Extranjero (Internacional)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nacionalidad</Label>
              <Input 
                id="nationality" 
                required 
                className="rounded-xl border-border h-11"
                value={formData.nationality}
                onChange={e => setFormData({...formData, nationality: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Punto de Ingreso / Sitio Turístico</Label>
            <select 
              id="site_id"
              required
              className="w-full bg-card border border-border rounded-xl h-11 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.site_id}
              onChange={e => setFormData({...formData, site_id: e.target.value})}
            >
              <option value="">Seleccione un sitio del catálogo...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="entry_date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha de Ingreso</Label>
              <Input 
                id="entry_date" 
                type="date" 
                required 
                className="rounded-xl border-border h-11"
                value={formData.entry_date}
                onChange={e => setFormData({...formData, entry_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hora de Registro</Label>
              <Input 
                id="entry_time" 
                type="time" 
                required 
                className="rounded-xl border-border h-11"
                value={formData.entry_time}
                onChange={e => setFormData({...formData, entry_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Referencia de Ticket / Boleto</Label>
            <Input 
              id="ticket_number" 
              className="rounded-xl border-border h-11"
              placeholder="Ej. T-998877"
              value={formData.ticket_number}
              onChange={e => setFormData({...formData, ticket_number: e.target.value})}
            />
          </div>

          <div className="pt-6 flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl h-12 font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Descartar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-xl h-12 font-bold bg-primary shadow-lg shadow-primary/30"
              disabled={submitting}
            >
              {submitting ? 'Procesando...' : (editingVisitor ? 'Guardar Cambios' : 'Confirmar Registro')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
