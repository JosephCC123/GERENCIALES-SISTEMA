import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  Building2, 
  Mail, 
  Phone, 
  Trash2,
  Edit2,
  Search
} from 'lucide-react';
import api from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { debounce } from 'lodash';

interface Operator {
  id: number;
  business_name: string;
  ruc: string;
  email: string;
  phone: string;
  operator_type: string;
  status: string;
  license_number: string;
  license_expiry: string;
}

export function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);

  const [formData, setFormData] = useState({
    business_name: '',
    ruc: '',
    email: '',
    phone: '',
    operator_type: 'agencia',
    license_number: '',
    license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'Activo'
  });

  const fetchOperators = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/tourism-operators?search=${search}`);
      setOperators(response.data.data || []);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const debouncedSearch = useCallback(
    debounce((term: string) => fetchOperators(term), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este operador?')) return;
    try {
      await api.delete(`/tourism-operators/${id}`);
      setOperators(operators.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting operator:', error);
      alert('Error al eliminar operador');
    }
  };

  const handleEdit = (op: Operator) => {
    setEditingOperator(op);
    setFormData({
      business_name: op.business_name,
      ruc: op.ruc,
      email: op.email || '',
      phone: op.phone || '',
      operator_type: op.operator_type,
      license_number: op.license_number,
      license_expiry: op.license_expiry,
      status: op.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOperator) {
        await api.put(`/tourism-operators/${editingOperator.id}`, formData);
      } else {
        await api.post('/tourism-operators', formData);
      }
      setIsModalOpen(false);
      setEditingOperator(null);
      resetForm();
      fetchOperators(searchTerm);
    } catch (error) {
      console.error('Error saving operator:', error);
      alert('Error al guardar operador');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      business_name: '',
      ruc: '',
      email: '',
      phone: '',
      operator_type: 'agencia',
      license_number: '',
      license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: 'Activo'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Operadores Turísticos" 
        description="Directorio de agencias y operadores certificados."
        buttonLabel="Nuevo Operador"
        onButtonClick={() => {
          setEditingOperator(null);
          resetForm();
          setIsModalOpen(true);
        }}
      />

      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por razón social, RUC o licencia..." 
          className="pl-10 rounded-full bg-card h-12 shadow-sm border-border focus:ring-primary" 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)
        ) : (
          operators.map((op) => (
            <Card key={op.id} className="p-6 border-border group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{op.business_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{op.operator_type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => handleEdit(op)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDelete(op.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{op.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{op.phone}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">RUC: {op.ruc}</span>
                <div className="flex gap-2 items-center">
                  <span className={`w-2 h-2 rounded-full ${op.status === 'Activo' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                  <span className={`text-[10px] font-bold uppercase ${op.status === 'Activo' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {op.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingOperator ? "Editar Operador" : "Registrar Nuevo Operador"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Razón Social</Label>
            <Input 
              id="business_name" 
              required 
              value={formData.business_name}
              onChange={e => setFormData({...formData, business_name: e.target.value})}
              placeholder="Ej. Cusco Travel SAC"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC (11 dígitos)</Label>
              <Input 
                id="ruc" 
                required 
                maxLength={11}
                value={formData.ruc}
                onChange={e => setFormData({...formData, ruc: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator_type">Tipo de Servicio</Label>
              <select 
                id="operator_type"
                className="w-full bg-card border border-border rounded-lg p-2 text-sm"
                value={formData.operator_type}
                onChange={e => setFormData({...formData, operator_type: e.target.value})}
              >
                <option value="agencia">Agencia de Viajes</option>
                <option value="hotel">Establecimiento Hospedaje</option>
                <option value="transporte">Transporte Turístico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Contacto</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / Celular</Label>
              <Input 
                id="phone" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_number">N° Licencia DIRCETUR</Label>
              <Input 
                id="license_number" 
                required 
                value={formData.license_number}
                onChange={e => setFormData({...formData, license_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_expiry">Vencimiento Licencia</Label>
              <Input 
                id="license_expiry" 
                type="date" 
                required 
                value={formData.license_expiry}
                onChange={e => setFormData({...formData, license_expiry: e.target.value})}
              />
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
              {submitting ? 'Guardando...' : (editingOperator ? 'Guardar Cambios' : 'Registrar Operador')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
