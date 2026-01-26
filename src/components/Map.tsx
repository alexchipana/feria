import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useStore } from '../store/useStore';
import type { Stall, Sector } from '../types';
import { Navigation } from 'lucide-react';
import { useEffect } from 'react';

// Fix for default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    stalls: Stall[];
    sectors: Sector[];
    isAdmin?: boolean;
    onLocationSelect?: (lat: number, lng: number) => void;
    isTracing?: boolean;
    tracingOpacity?: number;
    onSectorCreate?: (geojson: any) => void;
}

// Component to handle map clicks for admin
const LocationPicker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Controller to handle map zooming and movement
const MapController = () => {
    const map = useMap();
    const { selectedSector, selectedStall } = useStore();

    useEffect(() => {
        if (selectedSector && selectedSector.geojson?.geometry?.coordinates) {
            const { type, coordinates } = selectedSector.geojson.geometry;
            let coords: [number, number][] = [];

            if (type === 'Polygon') {
                coords = coordinates[0];
            } else if (type === 'LineString') {
                coords = coordinates;
            }

            if (coords.length > 0) {
                const lats = coords.map((c: any) => c[1]);
                const lngs = coords.map((c: any) => c[0]);
                const center: [number, number] = [
                    (Math.min(...lats) + Math.max(...lats)) / 2,
                    (Math.min(...lngs) + Math.max(...lngs)) / 2
                ];
                map.flyTo(center, 18, { animate: true, duration: 1.5 });
            }
        }
    }, [selectedSector, map]);

    useEffect(() => {
        if (selectedStall) {
            map.flyTo([selectedStall.lat, selectedStall.lng], 18, { animate: true, duration: 1.5 });
        }
    }, [selectedStall, map]);

    return null;
};

const GeomanController = ({ isTracing, onSectorCreate }: { isTracing?: boolean, onSectorCreate?: (geojson: any) => void }) => {
    const map = useMap();

    useEffect(() => {
        if (isTracing) {
            map.pm.addControls({
                position: 'topleft',
                drawCircle: false,
                drawMarker: false,
                drawCircleMarker: false,
                drawRectangle: false,
                drawPolygon: true,
                drawLine: true,
                editMode: true,
                dragMode: true,
                cutPolygon: false,
                removalMode: true,
            });

            map.pm.setGlobalOptions({
                snapDistance: 20,
                allowSelfIntersection: false,
                templineStyle: { color: '#3b82f6' },
                hintlineStyle: { color: '#3b82f6', dashArray: [5, 5] }
            });

            const handleCreate = (e: any) => {
                const layer = e.layer;
                const geojson = layer.toGeoJSON();
                if (onSectorCreate) {
                    onSectorCreate(geojson);
                }
                // Optional: remove layer after creation if we wait for Supabase update to show it
                // layer.remove();
            };

            map.on('pm:create', handleCreate);

            return () => {
                map.pm.removeControls();
                map.off('pm:create', handleCreate);
            };
        }
    }, [map, isTracing, onSectorCreate]);

    return null;
};

const UserLocationMarker = () => {
    const { userLocation } = useStore();
    if (!userLocation) return null;

    const icon = L.divIcon({
        className: 'user-location-pulse',
        html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>`,
    });

    return <Marker position={userLocation} icon={icon} />;
};

export const Map = ({ stalls, sectors, isAdmin, onLocationSelect, isTracing, tracingOpacity = 0.5, onSectorCreate }: MapProps) => {
    const { setSelectedStall } = useStore();
    const center: [number, number] = [-16.496, -68.185];

    // Calculated bounds for 1.webp based on landmarks
    // Approximated from Ceja to Ballivian/Chacaltaya area
    const imageBounds: L.LatLngBoundsExpression = [
        [-16.510, -68.195], // SW
        [-16.485, -68.155]  // NE
    ];

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={16}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController />
                <GeomanController isTracing={isTracing} onSectorCreate={onSectorCreate} />

                {isTracing && (
                    <ImageOverlay
                        url="/1.webp"
                        bounds={imageBounds}
                        opacity={tracingOpacity}
                        zIndex={500}
                    />
                )}

                {/* Sectors */}
                {sectors.map((sector) => {
                    if (!sector.geojson?.geometry?.coordinates) return null;

                    const type = sector.geojson.geometry.type;
                    const coords = sector.geojson.geometry.coordinates;

                    if (type === 'Polygon') {
                        return (
                            <Polygon
                                key={sector.id}
                                positions={coords[0].map((coord: any) => [coord[1], coord[0]])}
                                pathOptions={{
                                    fillColor: sector.color,
                                    fillOpacity: 0.3,
                                    color: sector.color,
                                    weight: 2,
                                }}
                            >
                                <Popup>{sector.name}</Popup>
                            </Polygon>
                        );
                    }

                    if (type === 'LineString') {
                        return (
                            <Polyline
                                key={sector.id}
                                positions={coords.map((coord: any) => [coord[1], coord[0]])}
                                pathOptions={{
                                    color: sector.color,
                                    weight: 4,
                                    opacity: 1
                                }}
                            >
                                <Popup>{sector.name}</Popup>
                            </Polyline>
                        );
                    }

                    return null;
                })}

                {/* Stalls */}
                {stalls.map((stall) => (
                    <Marker
                        key={stall.id}
                        position={[stall.lat, stall.lng]}
                        eventHandlers={{
                            click: () => setSelectedStall(stall),
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                {stall.image_url && (
                                    <img
                                        src={stall.image_url}
                                        alt={stall.name}
                                        className="w-full h-32 object-cover rounded-xl mb-2"
                                    />
                                )}
                                <h3 className="font-bold text-lg">{stall.name}</h3>
                                <p className="text-sm text-slate-500 mb-2">{stall.category}</p>
                                <button
                                    className="w-full btn btn-primary text-xs"
                                    onClick={() => setSelectedStall(stall)}
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <UserLocationMarker />

                {isAdmin && onLocationSelect && (
                    <LocationPicker onSelect={onLocationSelect} />
                )}
            </MapContainer>

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => {
                        if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                                useStore.getState().setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                            });
                        }
                    }}
                    className="p-3 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-primary-600 transition-colors"
                    title="Mi ubicación"
                >
                    <Navigation className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
