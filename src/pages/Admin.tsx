import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Map } from '../components/Map';
import { Save, Plus, X, Upload, MapPin } from 'lucide-react';
import type { Stall } from '../types';

export const Admin = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [uploading, setUploading] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [stalls] = useState<Stall[]>([]);

    const onSubmit = async (data: any) => {
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
            // Refresh stalls list...
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
                <h1 className="text-xl font-bold text-slate-900">Panel de Administración</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Puesto
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Map for context */}
                <div className="flex-1 relative">
                    <Map
                        stalls={stalls}
                        sectors={[]}
                        isAdmin={isAdding}
                        onLocationSelect={(lat, lng) => setSelectedCoords({ lat, lng })}
                    />
                    {isAdding && !selectedCoords && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-primary-600 text-white rounded-full shadow-xl animate-bounce">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Haz click en el mapa para fijar la ubicación
                            </p>
                        </div>
                    )}
                </div>

                {/* Form Modal/Panel */}
                {isAdding && (
                    <div className="w-full lg:w-96 bg-white border-l border-slate-200 overflow-y-auto p-6 fixed lg:relative inset-0 lg:inset-auto z-[2000]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Agregar Puesto</h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
