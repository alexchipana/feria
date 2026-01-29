import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, CircleMarker, LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
            } else if (type === 'MultiPoint') {
                coords = coordinates;
            } else if (type === 'Point') {
                coords = [coordinates];
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

export const Map = ({ stalls, sectors, isAdmin, onLocationSelect }: MapProps) => {
    const { setSelectedStall } = useStore();
    const center: [number, number] = [-16.496, -68.185];

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

                    if (type === 'Point') {
                        return (
                            <CircleMarker
                                key={sector.id}
                                center={[coords[1], coords[0]]}
                                pathOptions={{
                                    color: sector.color,
                                    fillColor: sector.color,
                                    fillOpacity: 0.7
                                }}
                                radius={8}
                            >
                                <Popup>{sector.name}</Popup>
                            </CircleMarker>
                        );
                    }

                    if (type === 'MultiPoint') {
                        return (
                            <LayerGroup key={sector.id}>
                                {coords.map((coord: any, idx: number) => (
                                    <CircleMarker
                                        key={`${sector.id}-${idx}`}
                                        center={[coord[1], coord[0]]}
                                        pathOptions={{
                                            color: sector.color,
                                            fillColor: sector.color,
                                            fillOpacity: 0.7
                                        }}
                                        radius={6}
                                    >
                                        <Popup>{sector.name}</Popup>
                                    </CircleMarker>
                                ))}
                            </LayerGroup>
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
