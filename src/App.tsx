import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Sector, Stall } from './types';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { StallModal } from './components/StallModal';
import { Admin } from './pages/Admin';
import { Map as MapIcon, LayoutGrid, Settings, Menu, Plus, MapPin } from 'lucide-react';

function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [activeTab, setActiveTab] = useState<'map' | 'directory'>('map');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const { setSidebarOpen } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log("Iniciando descarga de datos de Supabase...");
    const { data: sectorsData, error: sError } = await supabase.from('sectors').select('*');
    const { data: stallsData, error: stError } = await supabase.from('stalls').select('*');

    if (sError) console.error("Error cargando sectores:", sError);
    if (stError) console.error("Error cargando puestos:", stError);

    console.log("Sectores recibidos:", sectorsData?.length || 0);
    console.log("Puestos recibidos:", stallsData?.length || 0);

    if (sectorsData) setSectors(sectorsData);
    if (stallsData) setStalls(stallsData);
  };

  if (view === 'admin') {
    return (
      <div className="h-screen flex flex-col">
        <div className="absolute top-4 left-4 z-[3000]">
          <button
            onClick={() => setView('home')}
            className="btn bg-white shadow-xl border border-slate-100 flex items-center gap-2"
          >
            <MapIcon className="w-5 h-5 text-primary-600" />
            Volver al Mapa
          </button>
        </div>
        <Admin />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col lg:flex-row bg-slate-50 overflow-hidden font-outfit">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Feria 16 de Julio</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Sidebar - Now visible on PC by default */}
      <Sidebar stalls={stalls} view={activeTab} setView={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {/* PC Header View Toggle */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">
            Feria 16 de Julio - Directorio Digital
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MapIcon className="w-4 h-4" />
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'directory' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Directorio
            </button>
          </div>
          <div className="w-20"></div> {/* Spacer to center the toggle */}
        </div>

        <div className="flex-1 relative">
          {/* Map is always rendered but might be partially covered if we wanted overlay, 
              but here we use the toggle to decide what's prominent */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <Map stalls={stalls} sectors={sectors} />
          </div>

          <div className={`absolute inset-0 bg-slate-50 overflow-y-auto p-8 transition-opacity duration-300 ${activeTab === 'directory' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stalls.map(stall => (
                <div key={stall.id} className="card hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col gap-4">
                  {stall.image_url ? (
                    <img src={stall.image_url} alt={stall.name} className="w-full h-40 rounded-xl object-cover" />
                  ) : (
                    <div className="w-full h-40 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <MapPin className="w-10 h-10" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors text-lg">{stall.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">{stall.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Admin Toggle */}
        <div className="absolute bottom-24 lg:bottom-8 right-4 lg:right-6 z-[1000] flex flex-col gap-3">
          <button
            onClick={() => setView('admin')}
            className="w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all hover:scale-110"
            title="Administración"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-6 z-[1002]">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-primary-600' : 'text-slate-400'}`}
          >
            <MapIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Mapa</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'directory' ? 'text-primary-600' : 'text-slate-400'}`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-bold">Directorio</span>
          </button>
          <div
            onClick={() => setView('admin')}
            className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-10 border-4 border-slate-50 cursor-pointer"
          >
            <Plus className="w-6 h-6" />
          </div>
          <button
            onClick={() => setView('admin')}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold">Admin</span>
          </button>
        </nav>
      </main>

      {/* Modals */}
      <StallModal />
    </div>
  );
}

export default App;
