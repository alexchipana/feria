import { useStore } from '../store/useStore';
import { X, Phone, MessageCircle, Clock, MapPin, Star, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StallModal = () => {
    const { selectedStall, setSelectedStall } = useStore();

    if (!selectedStall) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-end lg:items-center justify-center p-0 lg:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedStall(null)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-2xl bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
                >
                    {/* Header Image */}
                    <div className="relative h-64 lg:h-80 w-full overflow-hidden">
                        {selectedStall.image_url ? (
                            <img src={selectedStall.image_url} alt={selectedStall.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <MapPin className="w-16 h-16 text-slate-200" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <button
                            onClick={() => setSelectedStall(null)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full mb-2 inline-block">
                                {selectedStall.category}
                            </span>
                            <h2 className="text-3xl font-bold text-white shadow-sm">{selectedStall.name}</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Sobre el puesto</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {selectedStall.description || "Este vendedor aún no ha añadido una descripción detallada."}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900">Contacto</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedStall.contact_phone && (
                                            <a href={`tel:${selectedStall.contact_phone}`} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-200 transition-colors">
                                                <Phone className="w-5 h-5 text-primary-600" />
                                                <div>
                                                    <p className="text-xs text-slate-400">Llamar</p>
                                                    <p className="font-medium text-slate-700">{selectedStall.contact_phone}</p>
                                                </div>
                                            </a>
                                        )}
                                        {selectedStall.whatsapp && (
                                            <a href={`https://wa.me/${selectedStall.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                                                <MessageCircle className="w-5 h-5 text-emerald-600" />
                                                <div>
                                                    <p className="text-xs text-emerald-400">WhatsApp</p>
                                                    <p className="font-medium text-emerald-700">Enviar mensaje</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Reseñas y Opiniones</h3>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <div className="flex justify-center gap-1 text-amber-500 mb-2">
                                            <Star className="w-6 h-6 fill-current" />
                                            <Star className="w-6 h-6 fill-current" />
                                            <Star className="w-6 h-6 fill-current" />
                                            <Star className="w-6 h-6 fill-current" />
                                            <Star className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-600 font-medium">4.0 (12 valoraciones)</p>
                                        <button className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                            Escribir reseña
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Horario</p>
                                            <p className="text-sm font-medium text-slate-700">{selectedStall.opening_hours || "Jueves y Domingos"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Ubicación</p>
                                            <p className="text-sm font-medium text-slate-700">Sector Ropa, Pasaje 4</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Compartir puesto
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
