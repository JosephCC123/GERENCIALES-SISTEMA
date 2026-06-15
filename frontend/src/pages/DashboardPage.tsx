import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  TrendingUp, 
  Map as MapIcon, 
  Calendar,
  Activity,
  Users,
  Globe,
  ArrowUpRight,
  AlertTriangle,
  Home,
  Heart
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
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface DashboardData {
  stats: any[];
  recent_activity: any[];
  trends: any[];
  origins: any[];
  capacities: {
    id: number;
    name: string;
    capacity: number;
    current_occupancy: number;
    saturation_percentage: number;
  }[];
  demographics_by_site: any[];
  health_metrics: any[];
  site_bubbles: any[];
  occupancy_trends: any[];
  occupancy_by_type: any[];
  visitors_by_day: any[];
  insights: {
    type: 'warning' | 'critical' | 'info' | 'success';
    title: string;
    message: string;
  }[];
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
    'Operadores Activos': Globe,
    'Guías Certificados': Users,
    'Hospedajes Activos': Home,
    'Ocupación Hotelera': Calendar,
    'Salud Operativa': Heart,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* INSIGHTS PANEL (ACTIONABLE AI/BI RULES) */}
      {!loading && data?.insights && data.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.insights.map((insight, idx) => {
            const isCrit = insight.type === 'critical';
            const isWarn = insight.type === 'warning';
            const isSucc = insight.type === 'success';
            const colorClass = isCrit ? 'border-red-500/50 bg-red-500/10' : 
                               isWarn ? 'border-yellow-500/50 bg-yellow-500/10' : 
                               isSucc ? 'border-green-500/50 bg-green-500/10' : 
                               'border-blue-500/50 bg-blue-500/10';
            const textClass = isCrit ? 'text-red-500' : 
                              isWarn ? 'text-yellow-600' : 
                              isSucc ? 'text-green-500' : 
                              'text-blue-500';

            return (
              <div key={idx} className={`p-4 rounded-xl border ${colorClass} flex flex-col gap-2`}>
                <div className={`font-bold flex items-center gap-2 ${textClass}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {insight.title}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : (
          data?.stats.map((stat, i) => {
            const Icon = iconsMap[stat.label] || TrendingUp;
            return (
              <div 
                key={i}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
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
                {stat.sparkline && stat.sparkline.length > 0 && (
                  <div className="h-10 mt-4 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stat.sparkline}>
                        <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} dot={false} className={stat.color} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Capacities - Real Time Saturation */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Saturación en Tiempo Real
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
          ) : data?.capacities?.map((site) => {
            const isCritical = site.saturation_percentage > 90;
            const isWarning = site.saturation_percentage > 70 && !isCritical;
            const barColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div key={site.id} className="p-4 border border-border rounded-xl bg-background/50 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm max-w-[80%] truncate">{site.name}</h3>
                  {isCritical && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`${barColor} h-2 rounded-full transition-all duration-1000`} 
                    style={{ width: `${Math.min(site.saturation_percentage, 100)}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                  <span>{site.current_occupancy} / {site.capacity}</span>
                  <span className={`font-bold ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                    {site.saturation_percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
                <ComposedChart data={data?.trends} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="nacional" stackId="a" fill="var(--primary)" name="Nacionales" radius={[0, 0, 4, 4]} />
                  <Bar yAxisId="left" dataKey="extranjero" stackId="a" fill="var(--secondary)" name="Extranjeros" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="Crecimiento (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Origin Pareto Chart */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-secondary" />
            Pareto de Orígenes (80/20)
          </h2>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.origins} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="nationality" axisLine={false} tickLine={false} tick={{fontSize: 10}} angle={-45} textAnchor="end" />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                  <Bar yAxisId="left" dataKey="total" fill="var(--primary)" name="Visitantes" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative_percent" stroke="#f59e0b" strokeWidth={2} dot={false} name="% Acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stacked Bar Chart: Demographics by Site */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Demografía por Sitio
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.demographics_by_site} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="site" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                  <Legend />
                  <Bar dataKey="nacional" stackId="a" fill="var(--primary)" name="Nacionales" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="extranjero" stackId="a" fill="var(--secondary)" name="Extranjeros" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Radar Chart: Operational Health */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent" />
              Salud Operativa Global
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.health_metrics}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Activos/Vigentes" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Bubble Chart: Site Performance */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Matriz de Rendimiento de Sitios (Volumen vs Duración vs Capacidad)
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name="Visitantes" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis type="number" dataKey="y" name="Días Estancia" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Capacidad" />
                  <Tooltip 
                    cursor={{strokeDasharray: '3 3'}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                    formatter={(value: any, name: string) => [value, name === 'x' ? 'Visitantes' : name === 'y' ? 'Días' : 'Capacidad']}
                  />
                  <Scatter name="Sitios" data={data?.site_bubbles} fill="var(--primary)" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-secondary" />
              Ocupación Hotelera
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.occupancy_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorOccupancy)" name="Ocupación (%)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Visitors by Day */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Visitantes por Día de la Semana
            </h2>
          </div>
          <div className="h-[250px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.visitors_by_day} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="total" fill="var(--primary)" name="Visitantes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Occupancy by Type */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-secondary" />
              Ocupación por Tipo de Alojamiento
            </h2>
          </div>
          <div className="h-[250px] w-full">
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.occupancy_by_type} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `${val}%`} />
                  <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="rate" fill="var(--secondary)" name="Ocupación (%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
