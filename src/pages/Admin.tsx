import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Map } from '../components/Map';
import { Save, Plus, X, Upload, MapPin, Map as MapIcon, Layers } from 'lucide-react';
import type { Stall, Sector } from '../types';
import { useStore } from '../store/useStore';

export const Admin = () => {
    const [adminView, setAdminView] = useState<'stalls' | 'sectors'>('stalls');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [uploading, setUploading] = useState(false);

    const { isDrawingMode, setDrawingMode } = useStore();
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const selectedSectorId = watch('sectorId');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: sData } = await supabase.from('sectors').select('*').order('name');
        const { data: stData } = await supabase.from('stalls').select('*');
        if (sData) setSectors(sData);
        if (stData) setStalls(stData);
    };

    const onSubmitStall = async (data: any) => {
        if (!selectedCoords) {
            alert("Por favor selecciona una ubicación en el mapa");
            return;
        }

        const { error } = await supabase.from('stalls').insert([{
            ...data,
            lat: selectedCoords.lat,
            lng: selectedCoords.lng
        }]);

        if (error) {
            console.error(error);
            alert("Error al guardar el puesto");
        } else {
            alert("Puesto guardado con éxito");
            setIsAdding(false);
            reset();
            setSelectedCoords(null);
            fetchData();
        }
    };

    const onSaveSector = async () => {
        if (!selectedSectorId || !drawnGeometry) {
            alert("Selecciona un sector y dibuja algo en el mapa");
            return;
        }

        const { error } = await supabase
            .from('sectors')
            .update({ geojson: drawnGeometry })
            .eq('id', selectedSectorId);

        if (error) {
            console.error(error);
            alert("Error al guardar el sector");
        } else {
            alert("Sector actualizado con éxito");
            setDrawingMode(false);
            setDrawnGeometry(null);
            fetchData();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `stalls/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('stalls')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('stalls')
                .getPublicUrl(filePath);

            setValue('image_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-900">Panel Admin</h1>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setAdminView('stalls')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminView === 'stalls' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <MapIcon className="w-4 h-4" />
                            Puestos
                        </button>
                        <button
                            onClick={() => setAdminView('sectors')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminView === 'sectors' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Layers className="w-4 h-4" />
                            Sectores
                        </button>
                    </div>
                </div>

                {adminView === 'stalls' && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`btn ${isAdding ? 'bg-slate-200 text-slate-600' : 'btn-primary'}`}
                    >
                        {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isAdding ? 'Cancelar' : 'Nuevo Puesto'}
                    </button>
                )}

                {adminView === 'sectors' && (
                    <button
                        onClick={() => setDrawingMode(!isDrawingMode)}
                        className={`btn ${isDrawingMode ? 'bg-red-500 text-white hover:bg-red-600' : 'btn-primary'}`}
                    >
                        {isDrawingMode ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                        {isDrawingMode ? 'Dejar de Dibujar' : 'Modo Dibujo'}
                    </button>
                )}
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Map Area */}
                <div className="flex-1 relative">
                    <Map
                        stalls={stalls}
                        sectors={sectors}
                        isAdmin={adminView === 'stalls' && isAdding}
                        onLocationSelect={(lat, lng) => setSelectedCoords({ lat, lng })}
                        onGeometryCreate={(geo) => setDrawnGeometry(geo)}
                    />

                    {adminView === 'stalls' && isAdding && !selectedCoords && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-primary-600 text-white rounded-full shadow-xl animate-bounce">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Haz click en el mapa para el puesto
                            </p>
                        </div>
                    )}

                    {adminView === 'sectors' && isDrawingMode && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 bg-white border-2 border-primary-500 text-primary-700 rounded-2xl shadow-2xl flex flex-col items-center gap-1">
                            <p className="text-xs font-black uppercase tracking-tight">Modo Dibujo Activo</p>
                            <p className="text-[10px] font-bold text-slate-400">Usa las herramientas de la izquierda del mapa</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Panel */}
                <div className={`w-full lg:w-[400px] bg-white border-l border-slate-200 overflow-y-auto p-6 flex flex-col transition-all ${(!isAdding && adminView === 'stalls') ? 'lg:w-0 p-0 overflow-hidden' : ''}`}>

                    {/* Add Stall Form */}
                    {adminView === 'stalls' && isAdding && (
                        <form onSubmit={handleSubmit(onSubmitStall)} className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase">Información del Puesto</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre</label>
                                    <input {...register('name', { required: true })} className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm" placeholder="Nombre del negocio" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                                    <select {...register('category', { required: true })} className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm">
                                        <option value="">Selecciona...</option>
                                        {sectors.map(s => (
                                            <option key={s.id} value={s.name.split(' - ').pop()}>{s.name.split(' - ').pop()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Imagen</label>
                                    <div className="relative group cursor-pointer">
                                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                                        <div className="w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 group-hover:border-primary-300 group-hover:text-primary-500 transition-all">
                                            {uploading ? (
                                                <div className="animate-spin w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 mb-1" />
                                                    <span className="text-[10px] font-bold">Subir foto</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Latitud</label>
                                        <input value={selectedCoords?.lat || ''} readOnly className="w-full px-4 py-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Longitud</label>
                                        <input value={selectedCoords?.lng || ''} readOnly className="w-full px-4 py-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full btn btn-primary py-4 rounded-2xl shadow-lg shadow-primary-500/30">
                                <Save className="w-5 h-5" />
                                Guardar Puesto
                            </button>
                        </form>
                    )}

                    {/* Manage Sectors Form */}
                    {adminView === 'sectors' && (
                        <div className="space-y-8 flex flex-col h-full">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Dibujar Sectores</h2>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Selecciona una categoría y dibuja su área o calle en el mapa.
                                </p>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoría a Editar</label>
                                    <select
                                        {...register('sectorId')}
                                        className="w-full px-4 py-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-slate-700"
                                    >
                                        <option value="">Selecciona un sector...</option>
                                        {sectors.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={`p-6 rounded-3xl border-2 border-dashed transition-all ${drawnGeometry ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                                    {drawnGeometry ? (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-black text-green-700 uppercase">¡Dibujo Capturado!</p>
                                            <p className="text-[10px] font-bold text-green-600/70">Listo para guardar en Supabase</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-center opacity-40">
                                            <Layers className="w-12 h-12 text-slate-400" />
                                            <p className="text-xs font-bold text-slate-500 uppercase">Sin dibujo aún</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={onSaveSector}
                                    disabled={!drawnGeometry || !selectedSectorId}
                                    className="w-full btn btn-primary py-4 rounded-2xl shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    Guardar Sector
                                </button>
                                <button
                                    onClick={() => {
                                        setDrawnGeometry(null);
                                        setDrawingMode(false);
                                    }}
                                    className="w-full py-4 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors"
                                >
                                    Limpiar Dibujo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
