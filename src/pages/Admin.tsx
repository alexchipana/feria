import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Map } from '../components/Map';
import { Save, Plus, X, Upload, MapPin, Layers, MousePointer2, Type } from 'lucide-react';
import type { Stall, Sector } from '../types';
import { useEffect } from 'react';

export const Admin = () => {
    const [activeSection, setActiveSection] = useState<'stalls' | 'sectors'>('stalls');
    const [isAdding, setIsAdding] = useState(false);
    const [isTracing, setIsTracing] = useState(false);
    const [tracingOpacity, setTracingOpacity] = useState(0.5);
    const [sectorName, setSectorName] = useState('');
    const [sectorColor, setSectorColor] = useState('#3b82f6');
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [uploading, setUploading] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: sectorsData } = await supabase.from('sectors').select('*');
        const { data: stallsData } = await supabase.from('stalls').select('*');
        if (sectorsData) setSectors(sectorsData);
        if (stallsData) setStalls(stallsData);
    };

    const onSubmitStall = async (data: any) => {
        if (!selectedCoords) {
            alert("Por favor selecciona una ubicación en el mapa");
            return;
        }

        const { error } = await supabase.from('stalls').insert([{
            ...data,
            lat: selectedCoords.lat,
            lng: selectedCoords.lng,
            tags: data.tags?.split(',').map((t: string) => t.trim()) || []
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

    const onSectorCreate = async (geojson: any) => {
        if (!sectorName) {
            alert("Por favor ingresa un nombre para el sector antes de dibujar");
            return;
        }

        const { error } = await supabase.from('sectors').insert([{
            name: sectorName,
            color: sectorColor,
            geojson: geojson
        }]);

        if (error) {
            console.error(error);
            alert("Error al guardar el sector");
        } else {
            alert(`Sector "${sectorName}" guardado con éxito`);
            setSectorName('');
            // Refresh sectors
            const { data } = await supabase.from('sectors').select('*');
            if (data) setSectors(data);
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
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-slate-900">Panel de Administración</h1>
                    <nav className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveSection('stalls')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'stalls' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <MapPin className="w-4 h-4" />
                            Puestos
                        </button>
                        <button
                            onClick={() => setActiveSection('sectors')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'sectors' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Layers className="w-4 h-4" />
                            Sectores
                        </button>
                    </nav>
                </div>
                {activeSection === 'stalls' ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Puesto
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <Type className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nombre del sector..."
                                value={sectorName}
                                onChange={(e) => setSectorName(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium w-40"
                            />
                            <input
                                type="color"
                                value={sectorColor}
                                onChange={(e) => setSectorColor(e.target.value)}
                                className="w-6 h-6 rounded-md cursor-pointer border-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsTracing(!isTracing)}
                            className={`btn ${isTracing ? 'bg-amber-100 text-amber-700 border-amber-200' : 'btn-secondary'}`}
                        >
                            <MousePointer2 className="w-5 h-5" />
                            {isTracing ? 'Finalizar Calco' : 'Calcar Sectores'}
                        </button>
                    </div>
                )}
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative">
                    <Map
                        stalls={stalls}
                        sectors={sectors}
                        isAdmin={activeSection === 'stalls' && isAdding}
                        isTracing={activeSection === 'sectors' && isTracing}
                        tracingOpacity={tracingOpacity}
                        onSectorCreate={onSectorCreate}
                        onLocationSelect={(lat, lng) => setSelectedCoords({ lat, lng })}
                    />
                    {isTracing && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-slate-100 flex flex-col gap-3 min-w-[300px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mesa de Luz (Calco)</span>
                                <span className="text-xs font-bold text-primary-600">{Math.round(tracingOpacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={tracingOpacity}
                                onChange={(e) => setTracingOpacity(parseFloat(e.target.value))}
                                className="w-full accent-primary-600"
                            />
                            <p className="text-[10px] text-slate-500 text-center leading-tight">
                                Usa las herramientas de la izquierda para dibujar.<br />
                                Se guardará automáticamente al terminar cada forma.
                            </p>
                        </div>
                    )}
                    {activeSection === 'stalls' && isAdding && !selectedCoords && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-primary-600 text-white rounded-full shadow-xl animate-bounce">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Haz click en el mapa para fijar la ubicación
                            </p>
                        </div>
                    )}
                </div>

                {isAdding && (
                    <div className="w-full lg:w-96 bg-white border-l border-slate-200 overflow-y-auto p-6 fixed lg:relative inset-0 lg:inset-auto z-[2000]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Agregar Puesto</h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitStall)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Puesto</label>
                                <input {...register('name', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="Ej. El Palacio de la Chola" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                                <select {...register('category', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none">
                                    <option value="Ropa">Ropa</option>
                                    <option value="Comida">Comida</option>
                                    <option value="Repuestos">Repuestos</option>
                                    <option value="Electronica">Electrónica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                <textarea {...register('description')} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="Venta de ropa típica..." />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen</label>
                                <div className="relative group cursor-pointer">
                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 group-hover:border-primary-300 group-hover:text-primary-500 transition-all">
                                        {uploading ? (
                                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-1" />
                                                <span className="text-xs font-medium">Subir foto</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Latitud</label>
                                    <input value={selectedCoords?.lat || ''} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm outline-none" placeholder="Selecciona en mapa" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Longitud</label>
                                    <input value={selectedCoords?.lng || ''} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm outline-none" placeholder="Selecciona en mapa" />
                                </div>
                            </div>

                            <button type="submit" className="w-full btn btn-primary py-4">
                                <Save className="w-5 h-5" />
                                Guardar Puesto
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
