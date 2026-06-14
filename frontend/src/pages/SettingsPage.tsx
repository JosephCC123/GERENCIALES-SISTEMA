import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Save, Building, Bell, Shield, Database } from 'lucide-react';

export function SettingsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    institutionName: 'Dirección Regional de Comercio Exterior y Turismo',
    systemEmail: 'admin@gercetur.gob.pe',
    maxCapacityAlertThreshold: 90,
    maintenanceMode: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulating save
    setTimeout(() => {
      setSubmitting(false);
      alert('Configuraciones guardadas correctamente (Simulación)');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader 
        title="Configuración Global" 
        description="Ajustes del sistema y parámetros generales de operación."
      />

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="p-8 border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Información Institucional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nombre de la Institución</Label>
              <Input 
                value={settings.institutionName} 
                onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Correo de Contacto del Sistema</Label>
              <Input 
                type="email"
                value={settings.systemEmail} 
                onChange={(e) => setSettings({...settings, systemEmail: e.target.value})}
              />
            </div>
          </div>
        </Card>

        <Card className="p-8 border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" />
            Umbrales y Alertas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Umbral de Alerta de Capacidad (%)</Label>
              <Input 
                type="number" 
                max={100} 
                min={50}
                value={settings.maxCapacityAlertThreshold} 
                onChange={(e) => setSettings({...settings, maxCapacityAlertThreshold: parseInt(e.target.value)})}
              />
              <p className="text-xs text-muted-foreground mt-1">Se enviará alerta visual cuando la ocupación supere este límite.</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Seguridad y Mantenimiento
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Modo Mantenimiento</h3>
              <p className="text-sm text-muted-foreground">Bloquear el acceso al sistema para usuarios regulares (operadores y ejecutivos).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive"></div>
            </label>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            <div>
               <h3 className="font-bold flex items-center gap-2"><Database className="w-4 h-4"/> Respaldo de Base de Datos</h3>
               <p className="text-sm text-muted-foreground">Generar un respaldo manual del sistema.</p>
            </div>
            <Button variant="outline" type="button" onClick={() => alert('Respaldo en progreso...')} className="rounded-xl font-bold border-border shadow-sm">
              Generar Backup
            </Button>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" className="rounded-xl px-6 h-12">
            Descartar Cambios
          </Button>
          <Button type="submit" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </div>
  );
}
