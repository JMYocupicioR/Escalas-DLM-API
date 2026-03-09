import './index.css'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ScaleRunner } from './components/ScaleRunner'
import { ScaleBuilder } from './components/ScaleBuilder'
import { JSONImporter } from './components/JSONImporter'
import { ScaleBrowser } from './components/ScaleBrowser'
import { AuthGuard } from './components/AuthGuard'
import { supabase } from './lib/supabase'
import { ScaleService } from './services/ScaleService'
import { MedicalScale } from './medical-scale.schema'
import { LogOut, Shield } from 'lucide-react'
import { DebugConsole } from './components/DebugConsole'

// Mock Data for demonstration
const mockScale: MedicalScale = {
    name: "Índice de Barthel",
    acronym: "BI",
    description: "Medida genérica que valora el nivel de independencia del paciente con respecto a la realización de algunas actividades de la vida diaria.",
    categories: ["Geriatría", "Neurología", "Rehabilitación"],
    current_version: {
        version_number: "1.0",
        status: "published",
        config: {
            tags: [],
            instructions: "Interrogatorio directo al paciente o cuidador. Evalúa la capacidad REAL, no la teórica.",
            language: "es",
        },

        questions: [
            {
                id: "q1",
                text: "Comer",
                type: "single_choice",
                order_index: 1,
                options: [
                    { value: 0, label: "Incapaz", score: 0, order_index: 0 },
                    { value: 5, label: "Necesita ayuda para cortar, extender mantequilla, etc.", score: 5, order_index: 1 },
                    { value: 10, label: "Independiente (La comida está al alcance)", score: 10, order_index: 2 }
                ]
            },
            {
                id: "q2",
                text: "Lavarse (baño)",
                type: "single_choice",
                order_index: 2,
                options: [
                    { value: 0, label: "Dependiente", score: 0, order_index: 0 },
                    { value: 5, label: "Independiente (Entra y sale solo del baño)", score: 5, order_index: 1 }
                ]
            }
        ],
        scoring: {
            engine: "sum",
            ranges: [
                { min: 0, max: 20, label: "Dependencia Total", color: "#e74c3c", interpretation: "Requiere cuidados continuos.", alert_level: "critical" },
                { min: 21, max: 60, label: "Dependencia Severa", color: "#e67e22", interpretation: "Requiere ayuda importante.", alert_level: "high" },
                { min: 61, max: 90, label: "Dependencia Moderada", color: "#f1c40f", interpretation: "Requiere ayuda puntual.", alert_level: "medium" },
                { min: 91, max: 99, label: "Dependencia Leve", color: "#2ecc71", interpretation: "Mínima ayuda.", alert_level: "low" },
                { min: 100, max: 100, label: "Independiente", color: "#27ae60", interpretation: "Vida autónoma.", alert_level: "none" }
            ]
        }
    }
};

type View = 'browser' | 'demo' | 'builder' | 'importer'

const App = () => {
  const [view, setView] = useState<View>('browser')
  const [result, setResult] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editingScale, setEditingScale] = useState<MedicalScale | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await ScaleService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
        setIsSuperAdmin(profile.role === 'super_admin');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }


  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="bg-gray-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏥</span> ScaleForge
            </h1>
            
            <div className="h-6 w-px bg-gray-700 hidden md:block"></div>
            
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                {userProfile?.full_name || 'Usuario'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                {userProfile?.email}
              </span>
            </div>

            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-600/20 text-yellow-500 text-[10px] font-bold rounded border border-yellow-600/30 uppercase tracking-tighter" title="Super Administrator">
                <Shield size={10} /> ADMIN
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('browser')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === 'browser' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              📚 Catálogo
            </button>
            <button
              onClick={() => setView('demo')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === 'demo' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              Demo
            </button>
            
            {isSuperAdmin && (
              <>
                <div className="h-6 w-px bg-gray-700 mx-1"></div>
                <button
                  onClick={() => {
                    setEditingScale(null);
                    setView('builder');
                  }}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === 'builder' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Constructor
                </button>
                <button
                  onClick={() => setView('importer')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === 'importer' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Importador
                </button>
              </>
            )}
            
            <div className="h-6 w-px bg-gray-700 mx-1"></div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded text-gray-400 hover:bg-red-600/10 hover:text-red-500 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      {view === 'browser' && (
        <ScaleBrowser 
            isAdmin={isSuperAdmin} 
            onAddScale={() => {
                setEditingScale(null);
                setView('builder');
            }}
            onEdit={(scale) => {
                setEditingScale(scale);
                setView('builder');
            }} 
        />
      )}

      {view === 'demo' && (
        <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
          {!result ? (
              <ScaleRunner 
                scaleData={mockScale} 
                onSubmit={(data) => {
                    console.log("Submitted:", data);
                    setResult(data);
                }} 
              />
          ) : (
              <div className="p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-bold mb-4">Resultados de Evaluación</h2>
                  <pre className="bg-white p-4 rounded border">{JSON.stringify(result, null, 2)}</pre>
                  <button 
                    onClick={() => setResult(null)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                      Nueva Evaluación
                  </button>
              </div>
          )}
        </div>
      )}

      {view === 'builder' && (
        <ScaleBuilder 
            initialScale={editingScale}
            onSave={() => {
                setEditingScale(null);
                // Optionally redirect back to browser
                // setView('browser'); 
            }}
            onCancel={() => {
                setEditingScale(null);
                setView('browser');
            }}
        />
      )}
      {view === 'importer' && <JSONImporter />}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGuard>
      <App />
      <DebugConsole />
    </AuthGuard>
  </React.StrictMode>,
)
