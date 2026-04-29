import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  TrendingUp, 
  Map as MapIcon, 
  AlertTriangle,
  Calendar,
  ChevronRight,
  Activity,
  Users
} from 'lucide-react';
import api from '../lib/api';

interface DashboardData {
  stats: any[];
  recent_activity: any[];
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard-stats');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const iconsMap: Record<string, any> = {
    'Visitantes Hoy': TrendingUp,
    'Sitios Turísticos': MapIcon,
    'Operadores Activos': Activity,
    'Guías Certificados': Users,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            Panel Ejecutivo
          </h1>
          <p className="text-muted-foreground mt-2">
            Gobernanza y gestión del flujo turístico en tiempo real - Cusco.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-muted-foreground">Bienvenido,</p>
          <p className="text-lg font-bold text-primary">{user?.name || 'Administrador'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : (
          data?.stats.map((stat, i) => {
            const Icon = iconsMap[stat.label] || TrendingUp;
            return (
              <div 
                key={i}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-muted ${stat.color} border border-border`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</h3>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Ingresos Recientes
            </h2>
          </div>
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
              ))
            ) : data?.recent_activity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{activity.time}</p>
                  <p className="text-[10px] text-muted-foreground/60">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">
            Ver Registro Completo
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-3xl border border-border overflow-hidden h-[500px] relative group shadow-xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31032.553974443!2d-71.9934177306233!3d-13.525251268393527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x916e7f0d0e0e0e0e%3A0x0e0e0e0e0e0e0e0e!2sCusco%2C%20Peru!5e0!3m2!1sen!2spe!4v1714345000000!5m2!1sen!2spe" 
              className="absolute inset-0 w-full h-full border-0 transition-all duration-700" 
              style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              allowFullScreen
              loading="lazy"
            ></iframe>
            
            <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
              <div className="bg-background/80 backdrop-blur-2xl p-6 rounded-3xl border border-border shadow-2xl max-w-xs">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-primary" />
                  Monitor de Capacidad
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Visualización geoespacial de saturación turística y puntos críticos en el centro histórico de Cusco.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Sistemas OK</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-10">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Panel de Mapas Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
