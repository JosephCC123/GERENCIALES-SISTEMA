import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Server,
  Play,
  Terminal,
  Clock,
  Search,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../lib/api';

interface ComparisonData {
  entity: string;
  oltp_count: number;
  olap_count: number;
  deviation: number;
  status: 'synchronized' | 'out_of_sync';
}

interface StructureData {
  entity: string;
  oltp_table: string;
  olap_table: string;
  oltp_columns: string[];
  olap_columns: string[];
}

export default function BiManagementPage() {
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [isLoadingComparisons, setIsLoadingComparisons] = useState(true);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<Date | null>(null);

  const [structures, setStructures] = useState<StructureData[]>([]);
  const [isLoadingStructures, setIsLoadingStructures] = useState(false);
  const [isStructuresOpen, setIsStructuresOpen] = useState(false);

  const [queryEntity, setQueryEntity] = useState('visitors');
  const [queryId, setQueryId] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const fetchComparisons = async () => {
    setIsLoadingComparisons(true);
    try {
      const response = await api.get('/bi/compare-data');
      if (response.data && response.data.comparisons) {
        setComparisons(response.data.comparisons);
      }
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setIsLoadingComparisons(false);
    }
  };

  useEffect(() => {
    fetchComparisons();
  }, []);

  const handleExecuteEtl = async () => {
    if (!window.confirm('¿Estás seguro de ejecutar una Sincronización Completa? Esto puede tardar unos segundos.')) {
      return;
    }
    
    setIsExecuting(true);
    setExecutionLog('Iniciando script de Python (run_pipeline.py)...\nEsperando respuesta del servidor...');
    
    try {
      const response = await api.post('/bi/execute-etl');
      setExecutionLog(response.data.log || 'Ejecución completada sin logs.');
      setLastExecutionTime(new Date());
      // Refresh comparisons after a successful ETL
      await fetchComparisons();
    } catch (error: any) {
      console.error('Error executing ETL:', error);
      setExecutionLog(error.response?.data?.log || error.response?.data?.error || 'Error crítico al ejecutar el script.');
    } finally {
      setIsExecuting(false);
    }
  };

  const fetchStructures = async () => {
    if (structures.length > 0) return;
    setIsLoadingStructures(true);
    try {
      const response = await api.get('/bi/table-structures');
      if (response.data && response.data.structures) {
        setStructures(response.data.structures);
      }
    } catch (error) {
      console.error('Error fetching structures:', error);
    } finally {
      setIsLoadingStructures(false);
    }
  };

  const handleToggleStructures = () => {
    setIsStructuresOpen(!isStructuresOpen);
    if (!isStructuresOpen) {
      fetchStructures();
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryId) return;
    setIsQuerying(true);
    try {
      const response = await api.post('/bi/query-by-id', { entity: queryEntity, id: queryId });
      setQueryResult(response.data);
    } catch (error) {
      console.error(error);
      setQueryResult({ error: 'Fallo al buscar el registro.' });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-600" />
            Módulo Gerencial BI
          </h1>
          <p className="text-slate-500 mt-1">Orquestación del Data Warehouse y Auditoría de Integridad</p>
        </div>
        
        <button 
          onClick={handleExecuteEtl}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-lg transition-all ${
            isExecuting 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'
          }`}
        >
          {isExecuting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sincronizando DW...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Sincronizar Data Warehouse (Full Load)
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Auditor de Integridad */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Auditor de Integridad (OLTP vs OLAP)
              </h2>
              <button 
                onClick={fetchComparisons}
                disabled={isLoadingComparisons || isExecuting}
                className="text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                title="Actualizar comparativa"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingComparisons ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-semibold">Entidad / Dominio</th>
                    <th className="p-4 font-semibold text-center">Transaccional (MySQL)</th>
                    <th className="p-4 font-semibold text-center">Data Warehouse (MySQL DW)</th>
                    <th className="p-4 font-semibold text-center">Desviación</th>
                    <th className="p-4 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisons.length === 0 && !isLoadingComparisons && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">No hay datos de comparación disponibles.</td>
                    </tr>
                  )}
                  {comparisons.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{comp.entity}</td>
                      <td className="p-4 text-center font-mono text-slate-600">{comp.oltp_count.toLocaleString()}</td>
                      <td className="p-4 text-center font-mono text-indigo-600 font-semibold">{comp.olap_count.toLocaleString()}</td>
                      <td className="p-4 text-center font-mono">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          comp.deviation === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {comp.deviation > 0 ? '+' : ''}{comp.deviation.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {comp.status === 'synchronized' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Sincronizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-sm font-medium">
                            <XCircle className="w-4 h-4" /> Desincronizado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bg-blue-50/50 p-4 text-sm text-blue-800 flex items-start gap-3 border-t border-blue-100">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>¿Cómo funciona esto?</strong> El sistema consulta simultáneamente la base de datos viva (MySQL) y el entorno optimizado del Data Warehouse (MySQL DW). Si hay desviación, significa que han habido nuevas operaciones (inserciones o eliminaciones) en el sistema transaccional desde la última vez que presionaste el botón de sincronización.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Consola de Orquestación */}
        <div className="space-y-6">
          <div className="bg-[#1e1e1e] rounded-xl shadow-lg border border-slate-800 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-[#2d2d2d] p-3 border-b border-black flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
                <Terminal className="w-4 h-4" />
                <span>ETL_Runner_Console</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto font-mono text-sm flex-1 text-emerald-400 whitespace-pre-wrap">
              {executionLog ? (
                <div>
                  <span className="text-blue-400">root@cusco-bi:~#</span> python run_pipeline.py<br/>
                  {executionLog}
                </div>
              ) : (
                <div className="text-slate-500 italic flex flex-col items-center justify-center h-full gap-4">
                  <Server className="w-12 h-12 opacity-20" />
                  <p>Esperando ejecución...</p>
                  <p className="text-xs">Presiona el botón superior para iniciar el pipeline.</p>
                </div>
              )}
            </div>
            
            {lastExecutionTime && (
              <div className="bg-[#2d2d2d] p-2 text-xs text-slate-400 flex items-center gap-2 border-t border-black">
                <Clock className="w-3 h-3" />
                Última ejecución: {lastExecutionTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Nueva fila para Auditoría Estructural y Consultor por ID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Izquierdo: Inspector de Registros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-indigo-600" />
              Inspector de Registros (Búsqueda por ID)
            </h2>
            <form onSubmit={handleQuery} className="flex gap-4">
              <select 
                value={queryEntity} 
                onChange={e => setQueryEntity(e.target.value)}
                className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="visitors">Visitantes</option>
                <option value="sites">Sitios Turísticos</option>
                <option value="accommodations">Hospedajes</option>
              </select>
              <input 
                type="number" 
                placeholder="ID del Registro (ej. 1)" 
                value={queryId}
                onChange={e => setQueryId(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit" 
                disabled={isQuerying}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 disabled:bg-slate-400"
              >
                {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </form>
          </div>

          <div className="p-0 flex-1 bg-slate-50 border-t border-slate-200 overflow-y-auto">
            {!queryResult ? (
              <div className="flex items-center justify-center h-full text-slate-400 min-h-[300px]">
                Busca un registro para ver la diferencia de mapeo MySQL vs Data Warehouse
              </div>
            ) : queryResult.error ? (
              <div className="p-6 text-rose-500">{queryResult.error}</div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">MySQL (Transaccional)</h3>
                  <pre className="text-xs bg-slate-800 text-emerald-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {queryResult.oltp_data ? JSON.stringify(queryResult.oltp_data, null, 2) : "Null / No Encontrado"}
                  </pre>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">MySQL (Data Warehouse)</h3>
                  <pre className="text-xs bg-slate-800 text-blue-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {queryResult.olap_data ? JSON.stringify(queryResult.olap_data, null, 2) : "Null / No Encontrado"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Auditor Estructural */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleToggleStructures}>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              Esquema de Tablas (Auditor Estructural)
            </h2>
            {isStructuresOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
          
          {isStructuresOpen && (
            <div className="p-0 overflow-y-auto max-h-[500px]">
              {isLoadingStructures ? (
                <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" /></div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {structures.map((s, idx) => (
                    <div key={idx} className="p-6">
                      <h3 className="font-bold text-slate-700 mb-4 text-lg">{s.entity}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase">OLTP: {s.oltp_table}</p>
                          <ul className="text-xs text-slate-600 space-y-1 font-mono">
                            {s.oltp_columns.length > 0 ? s.oltp_columns.map(c => <li key={c}>• {c}</li>) : <li>No aplica</li>}
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase">OLAP: {s.olap_table}</p>
                          <ul className="text-xs text-indigo-600 space-y-1 font-mono">
                            {s.olap_columns.length > 0 ? s.olap_columns.map(c => <li key={c}>• {c}</li>) : <li>No aplica / No extraída</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
