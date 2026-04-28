import { useAuthStore } from '@/store/authStore';
import { 
  TrendingUp, 
  Map as MapIcon, 
  AlertTriangle,
  Calendar,
  ChevronRight
} from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    { 
      label: 'Visitantes Hoy', 
      value: '1,254', 
      icon: TrendingUp, 
      trend: '+12%', 
      color: 'text-primary' 
    },
    { 
      label: 'Ocupación Hotelera', 
      value: '84%', 
      icon: MapIcon, 
      trend: 'Normal', 
      color: 'text-secondary' 
    },
    { 
      label: 'Alertas Activas', 
      value: '3', 
      icon: AlertTriangle, 
      trend: 'Atención', 
      color: 'text-destructive' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Panel Ejecutivo
        </h1>
        <p className="text-muted-foreground mt-2">
          Gobernanza y gestión del flujo turístico en tiempo real - Cusco.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-muted ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Actividad Reciente
            </h2>
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Ver todo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Ingreso Masivo: Machupicchu</p>
                  <p className="text-xs text-muted-foreground">Hace 15 minutos • Sector Llaqta</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">10:45 AM</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <MapIcon className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Monitor de Capacidad</h2>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-1">
              Visualiza el estado de los principales sitios arqueológicos en tiempo real.
            </p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            Abrir Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
