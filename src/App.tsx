import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Sector, Stall } from './types';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { StallModal } from './components/StallModal';
import { Map as MapIcon, LayoutGrid, Settings, Menu, MapPin as MapPinIcon, Search } from 'lucide-react';
import { Admin } from './pages/Admin';

function App() {
    const [view, setView] = useState<'home' | 'admin'>('home');
    const [activeTab, setActiveTab] = useState<'map' | 'directory'>('map');
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [stalls, setStalls] = useState<Stall[]>([]);
    const { setSidebarOpen, searchQuery, setSearchQuery } = useStore();

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
            {/* Sidebar - Visible on PC, Toggleable on Mobile */}
            <Sidebar stalls={stalls} sectors={sectors} />

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col overflow-hidden">
                {/* Top Header with Search Bar */}
                <header className="bg-white border-b border-slate-100 px-6 lg:px-12 py-4 flex items-center justify-between gap-6 z-20">
                    <div className="lg:hidden flex items-center gap-2">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 max-w-2xl mx-auto relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar puestos o productos..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/80 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-10 lg:w-32 flex justify-end">
                        {/* Profile icon or space as in screenshot */}
                    </div>
                </header>

                {/* View Toggle and Map/Directory */}
                <div className="flex-1 relative flex flex-col px-6 lg:px-8 py-4">
                    <div className="mb-4 flex items-center gap-2 z-10">
                        <h2 className="hidden lg:block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mr-6">
                            MAPA DE LA FERIA 16 DE JULIO
                        </h2>
                        <div className="inline-flex bg-white p-1 rounded-2xl shadow-soft border border-slate-100">
                            <button
                                onClick={() => setActiveTab('map')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <MapIcon className="w-4 h-4" />
                                Mapa
                            </button>
                            <button
                                onClick={() => setActiveTab('directory')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'directory' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Directorio
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative rounded-3xl overflow-hidden shadow-soft border border-slate-100">
                        {/* Map View */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <Map stalls={stalls} sectors={sectors} />
                        </div>

                        {/* Directory View */}
                        <div className={`absolute inset-0 bg-white overflow-y-auto p-6 lg:p-8 transition-opacity duration-300 ${activeTab === 'directory' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {stalls.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(stall => (
                                    <div key={stall.id} className="card hover:scale-[1.02] active:scale-95 cursor-pointer">
                                        {stall.image_url ? (
                                            <img src={stall.image_url} alt={stall.name} className="w-full h-44 rounded-xl object-cover mb-4" />
                                        ) : (
                                            <div className="w-full h-44 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                                                <MapPinIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{stall.name}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{stall.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Admin Button */}
                <button
                    onClick={() => setView('admin')}
                    className="absolute bottom-10 right-10 z-[1000] w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all hover:scale-110 active:scale-95 shadow-primary-500/10"
                    title="Administración"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </main>

            <StallModal />
        </div>
    );
}

export default App;
