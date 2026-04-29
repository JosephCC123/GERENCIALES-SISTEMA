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

        <div className="bg-card rounded-2xl border border-border overflow-hidden h-[400px] relative group lg:col-span-2">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31032.553974443!2d-71.9934177306233!3d-13.525251268393527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x916e7f0d0e0e0e0e%3A0x0e0e0e0e0e0e0e0e!2sCusco%2C%20Peru!5e0!3m2!1sen!2spe!4v1714345000000!5m2!1sen!2spe" 
            className="absolute inset-0 w-full h-full border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
            style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
            allowFullScreen
            loading="lazy"
          ></iframe>
          
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <div className="bg-background/90 backdrop-blur-xl p-4 rounded-2xl border border-border shadow-2xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-primary" />
                Mapa de Gestión Turística
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Visualización de puntos críticos y flujos en Cusco
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="bg-green-500/20 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full border border-green-500/30 backdrop-blur-md">
                ALTA DISPONIBILIDAD
              </span>
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/30 backdrop-blur-md">
                LIVE DATA
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-10">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Explorar Mapa Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
