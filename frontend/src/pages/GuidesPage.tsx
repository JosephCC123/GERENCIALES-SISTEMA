import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  BookOpen, 
  Languages, 
  Award,
  Trash2
} from 'lucide-react';
import api from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface Guide {
  id: number;
  full_name: string;
  license_number: string;
  languages: string;
  specialization: string;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
    languages: '',
    specialization: '',
    status: 'Activo'
  });

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certified-guides');
      setGuides(response.data.data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/certified-guides', formData);
      setIsModalOpen(false);
      setFormData({
        full_name: '',
        license_number: '',
        license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
        languages: '',
        specialization: '',
        status: 'Activo'
      });
      fetchGuides();
    } catch (error) {
      console.error('Error creating guide:', error);
      alert('Error al crear guía');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Guías Certificados" 
        description="Gestión de profesionales autorizados por DIRCETUR."
        buttonLabel="Nuevo Guía"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)
        ) : (
          guides.map((guide) => (
            <Card key={guide.id} className="p-6 border-border flex flex-col items-center text-center relative group">
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(guide.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Award className="w-10 h-10" />
              </div>

              <h3 className="font-bold text-lg">{guide.full_name}</h3>
              <p className="text-xs text-primary font-bold uppercase tracking-tighter mt-1">
                LIC: {guide.license_number}
              </p>

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Languages className="w-4 h-4" />
                  <span className="truncate">{guide.languages}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span className="truncate">{guide.specialization}</span>
                </div>
              </div>

              <button className="mt-6 w-full py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg text-sm font-bold transition-colors">
                Ver Perfil
              </button>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nuevo Guía Certificado"
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
              {submitting ? 'Registrando...' : 'Registrar Guía'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
