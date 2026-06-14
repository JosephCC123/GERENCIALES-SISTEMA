import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileSpreadsheet, Download, Filter, MapPin, Globe, Calendar, RefreshCw, BarChart2, Home, Users, CheckCircle2, Activity } from 'lucide-react';
import api from '../lib/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

type ReportType = 'general' | 'occupancy' | 'capacity' | 'operational';

export function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>('general');
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Filters State
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    site_id: 'all',
    nationality: 'all',
    accommodation_type: 'all',
    operational_subtype: 'operators' // operators | guides
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Temporarily store data for the invisible chart to render before capturing
  const [chartData, setChartData] = useState<any[]>([]);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch raw data from the new backend based on activeReport
      const response = await api.get('/bi/reports/advanced', { 
        params: { 
          type: activeReport,
          ...filters 
        } 
      });
      
      const reportData = response.data.data;
      if (!reportData || reportData.length === 0) {
        alert("No hay datos para estos criterios.");
        setLoading(false);
        return;
      }

      // 2. Prepare Data for the Chart 
      let processedChartData: any[] = [];
      let chartConfig = { title: '', type: '' };

      if (activeReport === 'general') {
        const grouped = reportData.reduce((acc: any, row: any) => {
          acc[row.site_name] = (acc[row.site_name] || 0) + Number(row.visit_count);
          return acc;
        }, {});
        processedChartData = Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
        chartConfig = { title: 'Total Visitantes por Sitio', type: 'bar' };
      } 
      else if (activeReport === 'occupancy') {
        const grouped = reportData.reduce((acc: any, row: any) => {
          const date = row.date;
          if (!acc[date]) acc[date] = { date, count: 0, sum: 0 };
          acc[date].count += 1;
          acc[date].sum += Number(row.occupancy_rate);
          return acc;
        }, {});
        processedChartData = Object.keys(grouped).map(k => ({ name: k, rate: Math.round(grouped[k].sum / grouped[k].count) }));
        chartConfig = { title: 'Ocupación Hotelera Promedio (%)', type: 'area' };
      }
      else if (activeReport === 'capacity') {
        const grouped = reportData.reduce((acc: any, row: any) => {
          if (!acc[row.site_name]) acc[row.site_name] = { site: row.site_name, count: 0, sum: 0 };
          acc[row.site_name].count += 1;
          acc[row.site_name].sum += Number(row.saturation_percentage);
          return acc;
        }, {});
        processedChartData = Object.keys(grouped).map(k => ({ name: k, value: Math.round(grouped[k].sum / grouped[k].count) }));
        chartConfig = { title: 'Saturación Promedio por Sitio (%)', type: 'bar' };
      }
      else if (activeReport === 'operational') {
        const grouped = reportData.reduce((acc: any, row: any) => {
          acc[row.status] = (acc[row.status] || 0) + 1;
          return acc;
        }, {});
        processedChartData = Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
        chartConfig = { title: 'Estado del Padrón Operativo', type: 'pie' };
      }

      setChartData(processedChartData);

      // Wait a bit for the chart to render in the DOM
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. Capture Chart with html2canvas
      let base64Image = '';
      if (chartContainerRef.current) {
         const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: '#ffffff', scale: 2 });
         base64Image = canvas.toDataURL('image/png');
      }

      // 4. Generate Excel using ExcelJS
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema Gerencial Cusco';
      workbook.lastModifiedBy = 'Usuario';
      workbook.created = new Date();

      // --- SHEET 1: Resumen Ejecutivo ---
      const summarySheet = workbook.addWorksheet('Resumen Ejecutivo');
      
      summarySheet.mergeCells('A1:F2');
      const titleCell = summarySheet.getCell('A1');
      titleCell.value = `Reporte Analítico: ${activeReport.toUpperCase()}`;
      titleCell.font = { name: 'Arial', family: 4, size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Blue-900

      summarySheet.getCell('A4').value = 'Fecha de Emisión:';
      summarySheet.getCell('B4').value = new Date().toLocaleString();
      summarySheet.getCell('A5').value = 'Total de Registros:';
      summarySheet.getCell('B5').value = reportData.length;

      summarySheet.columns = [
        { width: 25 }, { width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
      ];

      // Insert Image
      if (base64Image) {
        const imageId = workbook.addImage({ base64: base64Image, extension: 'png' });
        summarySheet.addImage(imageId, {
          tl: { col: 0, row: 7 },
          ext: { width: 600, height: 350 }
        });
      }

      // --- SHEET 2: Datos Raw ---
      const dataSheet = workbook.addWorksheet('Data Detallada');
      
      // Determine columns based on first row keys
      const columns = Object.keys(reportData[0]).map(key => ({
        header: key.replace(/_/g, ' ').toUpperCase(),
        key: key,
        width: 20
      }));
      dataSheet.columns = columns;

      // Style Header
      dataSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; // Blue-500
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Add Data
      reportData.forEach((row: any) => {
        dataSheet.addRow(row);
      });

      // 5. Download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Reporte_${activeReport.toUpperCase()}_${new Date().getTime()}.xlsx`);
      
    } catch (error) {
      console.error("Error generating advanced report:", error);
      alert("Hubo un error al generar el reporte. Revisa la consola.");
    } finally {
      setLoading(false);
      setChartData([]); // Clear chart data to hide it again
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Suite de Reportes</h1>
          <p className="text-muted-foreground mt-1">Exportación analítica multidimensional para toma de decisiones.</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
            onClick={() => setActiveReport('general')}
            className={`p-5 cursor-pointer transition-all border-2 ${activeReport === 'general' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
        >
            <BarChart2 className={`w-8 h-8 mb-3 ${activeReport === 'general' ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="font-bold text-lg">Flujo Turístico</h3>
            <p className="text-sm text-muted-foreground mt-1">Visitantes, demografía y estancias.</p>
        </Card>
        <Card 
            onClick={() => setActiveReport('occupancy')}
            className={`p-5 cursor-pointer transition-all border-2 ${activeReport === 'occupancy' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
        >
            <Home className={`w-8 h-8 mb-3 ${activeReport === 'occupancy' ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="font-bold text-lg">Ocupación Hotelera</h3>
            <p className="text-sm text-muted-foreground mt-1">Capacidad y rendimiento de hospedajes.</p>
        </Card>
        <Card 
            onClick={() => setActiveReport('capacity')}
            className={`p-5 cursor-pointer transition-all border-2 ${activeReport === 'capacity' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
        >
            <Activity className={`w-8 h-8 mb-3 ${activeReport === 'capacity' ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="font-bold text-lg">Saturación Sitios</h3>
            <p className="text-sm text-muted-foreground mt-1">Evaluación de capacidad de carga.</p>
        </Card>
        <Card 
            onClick={() => setActiveReport('operational')}
            className={`p-5 cursor-pointer transition-all border-2 ${activeReport === 'operational' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
        >
            <Users className={`w-8 h-8 mb-3 ${activeReport === 'operational' ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="font-bold text-lg">Padrón Operativo</h3>
            <p className="text-sm text-muted-foreground mt-1">Guías certificados y operadores turísticos.</p>
        </Card>
      </div>

      {/* Filters Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Criterios de Segmentación</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Dates - Hide if operational */}
          {activeReport !== 'operational' && (
            <>
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Fecha Inicio
                    </label>
                    <input 
                    type="date" 
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Fecha Fin
                    </label>
                    <input 
                    type="date" 
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </>
          )}

          {/* Operational Subtype Filter */}
          {activeReport === 'operational' && (
             <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> Entidad
                </label>
                <select 
                name="operational_subtype"
                value={filters.operational_subtype}
                onChange={handleFilterChange}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                <option value="operators">Operadores Turísticos</option>
                <option value="guides">Guías Certificados</option>
                </select>
            </div>
          )}

          {/* Site Filter */}
          {(activeReport === 'general' || activeReport === 'capacity') && (
            <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Sitio Turístico
                </label>
                <select 
                name="site_id"
                value={filters.site_id}
                onChange={handleFilterChange}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                <option value="all">Todos los Sitios</option>
                <option value="1">Machu Picchu</option>
                <option value="2">Ollantaytambo</option>
                <option value="3">Pisac</option>
                <option value="4">Moray</option>
                <option value="5">Chinchero</option>
                </select>
            </div>
          )}

          {/* Nationality Filter */}
          {activeReport === 'general' && (
            <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" /> Nacionalidad
                </label>
                <select 
                name="nationality"
                value={filters.nationality}
                onChange={handleFilterChange}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                <option value="all">Todas</option>
                <option value="Perú">Perú</option>
                <option value="USA">Estados Unidos</option>
                <option value="España">España</option>
                <option value="Francia">Francia</option>
                <option value="Brasil">Brasil</option>
                </select>
            </div>
          )}

          {/* Accommodation Type Filter */}
          {activeReport === 'occupancy' && (
            <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" /> Tipo Alojamiento
                </label>
                <select 
                name="accommodation_type"
                value={filters.accommodation_type}
                onChange={handleFilterChange}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                <option value="all">Todos</option>
                <option value="Hotel">Hotel</option>
                <option value="Hostal">Hostal</option>
                <option value="Lodge">Lodge</option>
                <option value="Resort">Resort</option>
                </select>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleExport} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-lg font-bold shadow-lg flex gap-3 items-center"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            {loading ? 'Generando Documento...' : 'Descargar Excel Profesional'}
          </Button>
        </div>
      </Card>

      {/* Hidden Chart Container for html2canvas */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div 
          ref={chartContainerRef} 
          style={{ width: '800px', height: '400px', padding: '20px', background: 'white' }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1e3a8a', fontFamily: 'sans-serif' }}>
            Gráfico Analítico: {activeReport.toUpperCase()}
          </h2>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
                {activeReport === 'general' || activeReport === 'capacity' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeReport === 'occupancy' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
