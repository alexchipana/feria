import { useStore } from '../store/useStore';
import type { Stall } from '../types';
import { Search, MapPin, Star, X, LayoutGrid, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    stalls: Stall[];
    view: 'map' | 'directory';
}

export const Sidebar = ({ stalls, view }: SidebarProps) => {
    const {
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        selectedStall, setSelectedStall,
        isSidebarOpen, setSidebarOpen
    } = useStore();

    const filteredStalls = stalls.filter(stall => {
        const matchesSearch = stall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stall.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || stall.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(stalls.map(s => s.category)));

    return (
        <div className={`fixed lg:relative z-[1001] lg:z-10 h-[100dvh] transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-[350px]' : 'w-0 lg:w-[350px] overflow-hidden lg:overflow-visible'}`}>
            <div className="h-full bg-white border-r border-slate-200 flex flex-col">
                {/* Header / Branding */}
                <div className="p-6 bg-white border-b border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <LayoutGrid className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                                    Feria 16 de Julio
                                </h1>
                                <p className="text-[10px] font-bold text-primary-600 tracking-[0.2em] uppercase">
                                    Directorio Digital El Alto
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar puestos o productos..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-100/80 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">
                            Filtrar por Categoría
                        </h2>
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${!selectedCategory ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                    <AnimatePresence>
                        {view === 'directory' && filteredStalls.map((stall) => (
                            <motion.div
                                key={stall.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => {
                                    setSelectedStall(stall);
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                                className={`card cursor-pointer group hover:border-primary-200 transition-all ${selectedStall?.id === stall.id ? 'ring-2 ring-primary-500 border-transparent shadow-lg' : ''}`}
                            >
                                <div className="flex gap-4">
                                    {stall.image_url ? (
                                        <img src={stall.image_url} alt={stall.name} className="w-16 h-16 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 text-sm">{stall.name}</h3>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium mb-1">{stall.category}</p>
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>4.5</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {view === 'directory' && filteredStalls.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <Search className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">No hay coincidencias.</p>
                        </div>
                    )}

                    {view === 'map' && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-40">
                            <MapPin className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="text-sm text-slate-400 font-medium">Explora los sectores directamente en el mapa</p>
                        </div>
                    )}
                </div>

                {/* Visual Aid Footer */}
                <div className="p-4 border-t border-slate-100">
                    <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                        <div className="flex gap-3 mb-2">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Info className="w-4 h-4 text-primary-600" />
                            </div>
                            <h4 className="text-xs font-bold text-primary-900 uppercase tracking-tighter">Ayuda Visual</h4>
                        </div>
                        <p className="text-[10px] text-primary-700 font-medium leading-relaxed">
                            Los polígonos de colores en el mapa indican los sectores especializados de la feria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
