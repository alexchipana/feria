
import fs from 'fs';
import fetch from 'node-fetch';
import * as turf from '@turf/turf';

// Embedded sectors data (Original Polygons)
const DEFAULT_SECTORS = [
    {
        name: "Sector Ropa",
        color: "#6366f1",
        geojson: {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-68.192, -16.500],
                    [-68.190, -16.500],
                    [-68.190, -16.502],
                    [-68.192, -16.502],
                    [-68.192, -16.500]
                ]]
            }
        }
    },
    {
        name: "Sector Comida",
        color: "#f59e0b",
        geojson: {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-68.189, -16.500],
                    [-68.187, -16.500],
                    [-68.187, -16.502],
                    [-68.189, -16.502],
                    [-68.189, -16.500]
                ]]
            }
        }
    },
    {
        name: "Sector Repuestos",
        color: "#64748b",
        geojson: {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-68.192, -16.503],
                    [-68.190, -16.503],
                    [-68.190, -16.505],
                    [-68.192, -16.505],
                    [-68.192, -16.503]
                ]]
            }
        }
    }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getStreetsForSector(sector) {
    if (!sector.geojson || !sector.geojson.geometry) return [];

    const polygon = sector.geojson;
    const bbox = turf.bbox(polygon);

    // Expand bbox slightly to ensure we catch connecting ways
    const query = `
        [out:json];
        (
          way["highway"](${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
        );
        (._;>;);
        out body;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching OSM data:", error);
        return null;
    }
}

function osmToGeoJSON(osmData) {
    const nodes = {};
    if (!osmData.elements) return [];

    osmData.elements.filter(e => e.type === 'node').forEach(n => {
        nodes[n.id] = [n.lon, n.lat];
    });

    const ways = osmData.elements.filter(e => e.type === 'way');
    const features = ways.map(way => {
        const coordinates = way.nodes.map(nid => nodes[nid]).filter(c => c);
        if (coordinates.length < 2) return null;
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: way.tags || {}
        };
    }).filter(f => f);

    return features;
}

function generateStallsOnLine(lineString, sectorPoly, interval = 0.003) { // 3 meters
    const stalls = [];
    const line = turf.lineString(lineString.geometry.coordinates);
    const length = turf.length(line, { units: 'kilometers' });
    const steps = Math.floor(length / interval);

    for (let i = 0; i < steps; i++) {
        const dist = i * interval;
        const point = turf.along(line, dist, { units: 'kilometers' });

        if (turf.booleanPointInPolygon(point, sectorPoly)) {
            const nextPoint = turf.along(line, dist + 0.001, { units: 'kilometers' });
            const bearing = turf.bearing(point, nextPoint);

            point.properties = {
                angle: bearing,
                street: lineString.properties.name || 'Unknown'
            };
            stalls.push(point);
        }
    }
    return stalls;
}

async function main() {
    let sqlUpdates = '';

    for (const sector of DEFAULT_SECTORS) {
        console.log(`Processing ${sector.name}...`);

        const osmData = await getStreetsForSector(sector);
        if (!osmData) continue;

        const streetFeatures = osmToGeoJSON(osmData);
        const sectorPoly = sector.geojson;

        let allStalls = [];

        for (const street of streetFeatures) {
            const stalls = generateStallsOnLine(street, sectorPoly);
            allStalls = [...allStalls, ...stalls];
        }

        const featureCollection = {
            type: 'FeatureCollection',
            features: allStalls
        };

        const geojsonStr = JSON.stringify(featureCollection).replace(/'/g, "''");

        if (allStalls.length > 0) {
            sqlUpdates += `UPDATE sectors SET geojson = '${geojsonStr}'::jsonb WHERE name = '${sector.name}';\n`;
            console.log(`Generated ${allStalls.length} stalls for ${sector.name}`);
        } else {
            console.log(`No stalls generated for ${sector.name}`);
        }

        await delay(2500);
    }

    fs.writeFileSync('updates_stalls.sql', sqlUpdates);
    console.log('Done. Wrote updates_stalls.sql');
}

main();
