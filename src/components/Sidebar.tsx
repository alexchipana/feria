import { useStore } from '../store/useStore';
import type { Stall } from '../types';
import { Search, MapPin, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    stalls: Stall[];
}

export const Sidebar = ({ stalls }: SidebarProps) => {
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
        <div className={`fixed lg:relative z-[1001] lg:z-10 h-[100dvh] transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-96' : 'w-0 lg:w-96 overflow-hidden lg:overflow-visible'}`}>
            <div className="h-full bg-white lg:bg-slate-50 border-r border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-6 bg-white border-b border-slate-100 lg:rounded-br-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">16 de Julio</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar puesto o producto..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                        {filteredStalls.map((stall) => (
                            <motion.div
                                key={stall.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
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
                                        <img src={stall.image_url} alt={stall.name} className="w-24 h-24 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{stall.name}</h3>
                                            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>4.5</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2 line-clamp-1">{stall.category}</p>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mt-auto">
                                            <MapPin className="w-3 h-3" />
                                            <span>Ver en mapa</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredStalls.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500">No encontramos puestos que coincidan con tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
