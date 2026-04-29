import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  TrendingUp, 
  Map as MapIcon, 
  Calendar,
  Activity,
  Users,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import api from '../lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardData {
  stats: any[];
  recent_activity: any[];
  trends: any[];
  origins: any[];
  distribution: any[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
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

      {/* KPI Stats */}
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
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-muted ${stat.color} border border-border flex items-center gap-1`}>
                    <ArrowUpRight className="w-3 h-3" />
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
        {/* Main Chart - Trends */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Tendencia de Flujo Turístico
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Mensual</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trends}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Origin Pie Chart */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-secondary" />
            Distribución por Origen
          </h2>
          <div className="h-[250px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.origins}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="nationality"
                  >
                    {data?.origins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {data?.origins.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-medium">{item.nationality}</span>
                </div>
                <span className="text-muted-foreground font-bold">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
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
          <button className="w-full mt-8 py-3 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors uppercase tracking-widest">
            Auditoría de Registros
          </button>
        </div>

        {/* Map - Now resized and polished */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-3xl border border-border overflow-hidden h-full min-h-[450px] relative group shadow-xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31032.553974443!2d-71.9934177306233!3d-13.525251268393527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x916e7f0d0e0e0e0e%3A0x0e0e0e0e0e0e0e0e!2sCusco%2C%20Peru!5e0!3m2!1sen!2spe!4v1714345000000!5m2!1sen!2spe" 
              className="absolute inset-0 w-full h-full border-0 transition-all duration-700 opacity-80" 
              style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              allowFullScreen
              loading="lazy"
            ></iframe>
            
            <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
              <div className="bg-background/80 backdrop-blur-2xl p-6 rounded-3xl border border-border shadow-2xl max-w-xs">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-primary" />
                  Monitor Geográfico
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Monitor de saturación en tiempo real para el Centro Histórico y atractivos periféricos.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Servicio Activo</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-10">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                Explorar Puntos de Interés
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
