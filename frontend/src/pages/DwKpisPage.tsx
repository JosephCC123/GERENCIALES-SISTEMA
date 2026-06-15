import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Globe, 
  Home, 
  Compass, 
  PieChart as ChartIcon, 
  Building,
  Activity
} from 'lucide-react';
import api from '../lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface KpiData {
  total_visitors: number;
  avg_duration: number;
  avg_occupancy_rate: number;
  top_site: string;
  top_site_visitors: number;
  top_country: string;
  top_country_visitors: number;
  top_purpose: string;
  top_purpose_visitors: number;
  top_age_group: string;
  top_age_group_visitors: number;
  top_accommodation_type: string;
  top_accommodation_rate: number;
  total_accommodations: number;
  total_sites: number;
  total_capacity: number;
  total_rooms: number;
}

interface DwKpisResponse {
  kpis: KpiData;
  charts: {
    monthly_trend: { period: string; total: number }[];
    occupancy_trend: { period: string; rate: number }[];
  };
}

export function DwKpisPage() {
  const [data, setData] = useState<DwKpisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const response = await api.get('/bi/dw-kpis');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching Data Warehouse KPIs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKpiData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Cargando KPIs del DW...</h1>
          <p className="text-muted-foreground mt-2">Consultando cubos de datos consolidados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <ChartIcon className="w-10 h-10 text-primary" />
          Métricas Consolidadas del Data Warehouse (OLAP)
        </h1>
        <p className="text-muted-foreground mt-2">
          Análisis multidimensional consolidado e histórico directamente de los hechos y dimensiones del Data Warehouse.
        </p>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Total Visitors */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Visitantes Históricos</h3>
            <p className="text-3xl font-extrabold text-foreground mt-1">{kpis?.total_visitors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Registros de fact_visitor_flow</p>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Promedio de Estadía</h3>
            <p className="text-3xl font-extrabold text-foreground mt-1">{kpis?.avg_duration} días</p>
            <p className="text-xs text-muted-foreground mt-2">En base a duraciones de viaje</p>
          </div>
        </div>

        {/* Avg Occupancy Rate */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ocupación Hotelera Promedio</h3>
            <p className="text-3xl font-extrabold text-foreground mt-1">{kpis?.avg_occupancy_rate}%</p>
            <p className="text-xs text-muted-foreground mt-2">Tasa histórica de hospedajes</p>
          </div>
        </div>

        {/* Top Site */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Atractivo Más Visitado</h3>
            <p className="text-lg font-extrabold text-foreground mt-1 truncate">{kpis?.top_site}</p>
            <p className="text-xs text-muted-foreground mt-2">{kpis?.top_site_visitors.toLocaleString()} visitas registradas</p>
          </div>
        </div>

        {/* Top Country */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Globe className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">País de Origen Principal</h3>
            <p className="text-lg font-extrabold text-foreground mt-1 truncate">{kpis?.top_country}</p>
            <p className="text-xs text-muted-foreground mt-2">{kpis?.top_country_visitors.toLocaleString()} visitantes</p>
          </div>
        </div>

        {/* Top Purpose */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Compass className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Propósito de Viaje Líder</h3>
            <p className="text-lg font-extrabold text-foreground mt-1 truncate">{kpis?.top_purpose}</p>
            <p className="text-xs text-muted-foreground mt-2">{kpis?.top_purpose_visitors.toLocaleString()} visitantes</p>
          </div>
        </div>

        {/* Top Age Group */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Grupo Demográfico Mayoritario</h3>
            <p className="text-lg font-extrabold text-foreground mt-1 truncate">{kpis?.top_age_group} años</p>
            <p className="text-xs text-muted-foreground mt-2">{kpis?.top_age_group_visitors.toLocaleString()} personas</p>
          </div>
        </div>

        {/* Top Accommodation Type */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
              <Home className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alojamiento de Mayor Demanda</h3>
            <p className="text-lg font-extrabold text-foreground mt-1 truncate">{kpis?.top_accommodation_type}</p>
            <p className="text-xs text-muted-foreground mt-2">{kpis?.top_accommodation_rate}% de ocupación promedio</p>
          </div>
        </div>

      </div>

      {/* Auxiliary DW Totals */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-primary" />
          Dimensiones Consolidadas del Data Warehouse
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-background/50 rounded-2xl border border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Sitios Turísticos</h4>
            <p className="text-2xl font-bold mt-1 text-foreground">{kpis?.total_sites}</p>
          </div>
          <div className="p-4 bg-background/50 rounded-2xl border border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Capacidad de Aforo Total</h4>
            <p className="text-2xl font-bold mt-1 text-foreground">{kpis?.total_capacity.toLocaleString()} personas/día</p>
          </div>
          <div className="p-4 bg-background/50 rounded-2xl border border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Hospedajes Registrados</h4>
            <p className="text-2xl font-bold mt-1 text-foreground">{kpis?.total_accommodations}</p>
          </div>
          <div className="p-4 bg-background/50 rounded-2xl border border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">Habitaciones Totales</h4>
            <p className="text-2xl font-bold mt-1 text-foreground">{kpis?.total_rooms.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Historical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visitors Monthly Trend */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            Evolución del Flujo de Visitantes (Mes a Mes)
          </h2>
          <div className="h-[300px] w-full">
            {data?.charts.monthly_trend && data.charts.monthly_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Visitantes" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos históricos en dim_time.</div>
            )}
          </div>
        </div>

        {/* Occupancy Monthly Trend */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Home className="w-6 h-6 text-emerald-500" />
            Tendencia Mensual de Ocupación Hotelera (%)
          </h2>
          <div className="h-[300px] w-full">
            {data?.charts.occupancy_trend && data.charts.occupancy_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.occupancy_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11}} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" name="Ocupación (%)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos de ocupación histórica en dim_time.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
