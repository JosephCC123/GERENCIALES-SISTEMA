import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  Building2, 
  MapPin, 
  Star, 
  Search,
  Trash2,
  Edit2,
  Bed,
  Phone,
  Hash
} from 'lucide-react';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { debounce } from 'lodash-es';

interface Accommodation {
  id: number;
  name: string;
  type: string;
  category: string;
  address: string;
  phone: string;
  total_rooms: number;
  status: string;
}

export function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Accommodation | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hotel',
    category: '3 Estrellas',
    address: '',
    phone: '',
    total_rooms: 0,
    status: 'Activo'
  });

  const fetchData = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/accommodations?search=${search}`);
      setAccommodations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const debouncedSearch = useCallback(
    debounce((term: string) => fetchData(term), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este establecimiento?')) return;
    try {
      await api.delete(`/accommodations/${id}`);
      setAccommodations(accommodations.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error al eliminar');
    }
  };

  const handleEdit = (item: Accommodation) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      category: item.category,
      address: item.address,
      phone: item.phone,
      total_rooms: item.total_rooms,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/accommodations/${editingItem.id}`, formData);
      } else {
        await api.post('/accommodations', formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      fetchData(searchTerm);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Hotel',
      category: '3 Estrellas',
      address: '',
      phone: '',
      total_rooms: 0,
      status: 'Activo'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Gestión de Hospedajes" 
        description="Directorio de hoteles, hostales y alojamientos autorizados."
        buttonLabel="Nuevo Establecimiento"
        onButtonClick={() => {
          setEditingItem(null);
          resetForm();
          setIsModalOpen(true);
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o dirección..." 
            className="pl-10 rounded-full bg-card h-12 shadow-sm border-border" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <Card className="border-border overflow-hidden shadow-xl rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Establecimiento</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categoría</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Habitaciones</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-muted/10"></td></tr>)
              ) : accommodations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">No hay establecimientos registrados.</td></tr>
              ) : (
                accommodations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Bed className="w-4 h-4 text-primary/60" />
                        {item.total_rooms} Hab.
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${
                        item.status === 'Activo' 
                        ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-primary rounded-xl">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive rounded-xl">
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
        title={editingItem ? "Editar Establecimiento" : "Registrar Nuevo Establecimiento"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase">Nombre del Establecimiento</Label>
            <Input 
              id="name" required 
              className="rounded-xl"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase">Tipo</Label>
              <select 
                id="type" className="w-full bg-card border rounded-xl h-11 px-4 text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Hotel">Hotel</option>
                <option value="Hostal">Hostal</option>
                <option value="Albergue">Albergue</option>
                <option value="Apart-Hotel">Apart-Hotel</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold uppercase">Categoría</Label>
              <select 
                id="category" className="w-full bg-card border rounded-xl h-11 px-4 text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="1 Estrella">1 Estrella</option>
                <option value="2 Estrellas">2 Estrellas</option>
                <option value="3 Estrellas">3 Estrellas</option>
                <option value="4 Estrellas">4 Estrellas</option>
                <option value="5 Estrellas">5 Estrellas</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-bold uppercase">Dirección</Label>
            <Input 
              id="address" required 
              className="rounded-xl"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase">Teléfono</Label>
              <Input 
                id="phone" className="rounded-xl"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_rooms" className="text-xs font-bold uppercase">N° Habitaciones</Label>
              <Input 
                id="total_rooms" type="number" required 
                className="rounded-xl"
                value={formData.total_rooms}
                onChange={e => setFormData({...formData, total_rooms: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl h-12 font-bold" disabled={submitting}>
              {submitting ? 'Guardando...' : (editingItem ? 'Guardar Cambios' : 'Registrar')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
