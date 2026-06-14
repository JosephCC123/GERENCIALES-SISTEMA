import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  BookOpen, 
  Languages, 
  Award,
  Trash2,
  Edit2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { debounce } from 'lodash-es';
import { useAuthStore } from '../store/authStore';

interface Guide {
  id: number;
  full_name: string;
  license_number: string;
  languages: string;
  specialization: string;
  license_expiry: string;
  status: string;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const user = useAuthStore(state => state.user);
  const canEdit = user?.roles?.some((role: any) => role.slug === 'admin' || role.slug === 'operador') ?? false;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
    languages: '',
    specialization: '',
    status: 'Activo'
  });

  const fetchGuides = async (search = '', page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/certified-guides?search=${search}&page=${page}`);
      setGuides(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides(searchTerm, currentPage);
  }, [currentPage]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setCurrentPage(1);
      fetchGuides(term, 1);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este guía?')) return;
    try {
      await api.delete(`/certified-guides/${id}`);
      setGuides(guides.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting guide:', error);
      alert('Error al eliminar guía');
    }
  };

  const handleEdit = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      full_name: guide.full_name,
      license_number: guide.license_number,
      license_expiry: guide.license_expiry,
      languages: guide.languages,
      specialization: guide.specialization,
      status: guide.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGuide) {
        await api.put(`/certified-guides/${editingGuide.id}`, formData);
      } else {
        await api.post('/certified-guides', formData);
      }
      setIsModalOpen(false);
      setEditingGuide(null);
      resetForm();
      fetchGuides(searchTerm);
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Error al guardar guía');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      license_number: '',
      license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
      languages: '',
      specialization: '',
      status: 'Activo'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Guías Certificados" 
        description="Gestión de profesionales autorizados por DIRCETUR."
        buttonLabel={canEdit ? "Nuevo Guía" : undefined}
        onButtonClick={() => {
          if (!canEdit) return;
          setEditingGuide(null);
          resetForm();
          setIsModalOpen(true);
        }}
      />

      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nombre, licencia o idiomas..." 
          className="pl-10 rounded-full bg-card h-12 shadow-sm border-border focus:ring-primary" 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Guía</th>
                <th className="px-6 py-4 font-medium">Licencia</th>
                <th className="px-6 py-4 font-medium">Especialidad</th>
                <th className="px-6 py-4 font-medium">Idiomas</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron guías
                  </td>
                </tr>
              ) : (
                guides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{guide.full_name}</p>
                          <span className={`inline-flex mt-1 items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${guide.status === 'Activo' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                            {guide.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{guide.license_number}</td>
                    <td className="px-6 py-4 text-muted-foreground">{guide.specialization}</td>
                    <td className="px-6 py-4 text-muted-foreground">{guide.languages}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-secondary hover:bg-secondary/10 h-8 w-8 p-0"
                          title="Ver Perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
                              onClick={() => handleEdit(guide)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              onClick={() => handleDelete(guide.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8"
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingGuide ? "Editar Guía Certificado" : "Registrar Nuevo Guía Certificado"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombres y Apellidos</Label>
            <Input 
              id="full_name" 
              required 
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_number">N° Carnet / Licencia</Label>
              <Input 
                id="license_number" 
                required 
                value={formData.license_number}
                onChange={e => setFormData({...formData, license_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_expiry">Vencimiento</Label>
              <Input 
                id="license_expiry" 
                type="date" 
                required 
                value={formData.license_expiry}
                onChange={e => setFormData({...formData, license_expiry: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Idiomas (separados por coma)</Label>
            <Input 
              id="languages" 
              required 
              placeholder="Ej. Español, Inglés, Quechua"
              value={formData.languages}
              onChange={e => setFormData({...formData, languages: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Especialidad</Label>
            <Input 
              id="specialization" 
              required 
              placeholder="Ej. Arqueología, Aventura"
              value={formData.specialization}
              onChange={e => setFormData({...formData, specialization: e.target.value})}
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
              {submitting ? 'Guardando...' : (editingGuide ? 'Guardar Cambios' : 'Registrar Guía')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
