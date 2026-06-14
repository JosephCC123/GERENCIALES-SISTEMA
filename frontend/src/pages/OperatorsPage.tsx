import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  Building2, 
  Mail, 
  Phone, 
  Trash2,
  Edit2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { debounce } from 'lodash-es';
import { useAuthStore } from '../store/authStore';

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
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const canEdit = user?.roles?.some((role: any) => role.slug === 'admin' || role.slug === 'operador') ?? false;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchOperators = async (search = '', page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/tourism-operators?search=${search}&page=${page}`);
      setOperators(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators(searchTerm, currentPage);
  }, [currentPage]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setCurrentPage(1);
      fetchOperators(term, 1);
    }, 500),
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
        buttonLabel={canEdit ? "Nuevo Operador" : undefined}
        onButtonClick={() => {
          if (!canEdit) return;
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

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Operador</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">RUC</th>
                  <th className="px-6 py-4 font-medium">Contacto</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
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
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : operators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No se encontraron operadores
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{op.business_name}</p>
                            <p className="text-xs text-muted-foreground">{op.license_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">{op.operator_type}</td>
                      <td className="px-6 py-4 font-mono">{op.ruc}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          {op.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {op.email}</span>}
                          {op.phone && <span className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {op.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${op.status === 'Activo' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${op.status === 'Activo' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          {op.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-secondary hover:bg-secondary/10 h-8 w-8 p-0"
                            onClick={() => navigate(`/operators/${op.id}`)}
                            title="Ver Expediente"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
                                onClick={() => handleEdit(op)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                onClick={() => handleDelete(op.id)}
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
