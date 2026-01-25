import { useStore } from '../store/useStore';
import type { Stall, Sector } from '../types';
import { LayoutGrid, Info, X } from 'lucide-react';

interface SidebarProps {
    stalls: Stall[];
    sectors: Sector[];
}

export const Sidebar = ({ sectors }: SidebarProps) => {
    const {
        selectedCategory, setSelectedCategory,
        setSelectedSector,
        isSidebarOpen, setSidebarOpen
    } = useStore();

    // Get unique categories from sectors or stalls
    const categories = Array.from(new Set(sectors.map(s => s.name.split(' - ').pop() || s.name)));

    const handleCategoryClick = (cat: string | null) => {
        setSelectedCategory(cat);

        if (cat) {
            // Find a sector that matches this category name
            const matchingSector = sectors.find(s => s.name.includes(cat));
            if (matchingSector) {
                setSelectedSector(matchingSector);
            }
        } else {
            setSelectedSector(null);
        }

        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    return (
        <div className={`fixed lg:relative z-[1001] lg:z-10 h-[100dvh] transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-[320px]' : 'w-0 lg:w-[320px] overflow-hidden lg:overflow-visible'}`}>
            <div className="h-full bg-white border-r border-slate-200 flex flex-col">

                {/* Branding Area */}
                <div className="p-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/40 transform -rotate-3 hover:rotate-0 transition-transform">
                                <LayoutGrid className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">
                                    FERIA 16 DE JULIO
                                </h1>
                                <p className="text-[10px] font-bold text-primary-500 tracking-widest mt-1">
                                    DIRECTORIO DIGITAL EL ALTO
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="flex-1 px-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">
                            Filtrar por Categoría
                        </h2>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => handleCategoryClick(null)}
                                className={`w-full text-left px-5 py-3 rounded-2xl text-[15px] font-bold transition-all duration-300 ${!selectedCategory ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'}`}
                            >
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`w-full text-left px-5 py-3 rounded-2xl text-[15px] font-bold transition-all duration-300 ${selectedCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Aid Area */}
                <div className="p-6 mt-auto">
                    <div className="p-6 bg-[#f0f4ff] rounded-[2.5rem] border border-primary-100 flex flex-col gap-3 relative overflow-hidden group">
                        {/* Background decoration */}
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-100/50 rounded-full blur-2xl group-hover:bg-primary-200/50 transition-colors" />

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Info className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="text-xs font-black text-[#1e293b] uppercase tracking-tighter">Ayuda Visual</span>
                        </div>
                        <p className="text-[11px] text-primary-700/80 font-semibold leading-relaxed relative z-10 px-1">
                            Los polígonos de colores en el mapa indican los sectores especializados de la feria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
