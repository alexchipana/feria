import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Sector, Stall } from './types';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { StallModal } from './components/StallModal';
import { Admin } from './pages/Admin';
import { Map as MapIcon, LayoutGrid, Settings, Menu, Bell, Plus } from 'lucide-react';

function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const { setSidebarOpen } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sectorsData } = await supabase.from('sectors').select('*');
    const { data: stallsData } = await supabase.from('stalls').select('*');

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
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Guía 16 de Julio</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400">
            <Bell className="w-6 h-6" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Directory Sidebar */}
      <Sidebar stalls={stalls} />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className="absolute inset-0">
          <Map stalls={stalls} sectors={sectors} />
        </div>

        {/* Floating Admin Toggle (for demo/development) */}
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
          <button className="flex flex-col items-center gap-1 text-primary-600">
            <MapIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Mapa</span>
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-bold">Directorio</span>
          </button>
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-10 border-4 border-slate-50">
            <Plus className="w-6 h-6" />
          </div>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-bold">Alertas</span>
          </button>
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
