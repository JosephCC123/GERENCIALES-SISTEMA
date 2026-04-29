import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  UserCog, 
  Mail, 
  Shield, 
  Trash2,
  Edit2,
  UserPlus,
  Building
} from 'lucide-react';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

interface User {
  id: number;
  name: string;
  email: string;
  role_name?: string;
  institution?: { name: string };
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Editor'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Gestión de Usuarios" 
        description="Administración de cuentas, roles y acceso institucional al sistema."
        buttonLabel="Nuevo Usuario"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse" />)
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-6 border-border hover:border-primary/20 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{user.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" /> Rol: <span className="font-bold text-foreground">{user.role_name || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="w-3.5 h-3.5" /> {user.institution?.name || 'Municipalidad del Cusco'}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-widest">
                  Activo
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nuevo Usuario"
      >
        <form className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Nombre Completo</Label>
            <Input className="rounded-xl h-11" placeholder="Ej. Juan Pérez" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Correo Electrónico</Label>
            <Input type="email" className="rounded-xl h-11" placeholder="usuario@cusco.gob.pe" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Rol en el Sistema</Label>
            <select className="w-full bg-card border rounded-xl h-11 px-4 text-sm">
              <option>Administrador</option>
              <option>Editor de Datos</option>
              <option>Solo Lectura / Reportes</option>
            </select>
          </div>
          <div className="pt-6">
            <Button type="button" className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20">
              Crear Cuenta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
