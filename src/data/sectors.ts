export const DEFAULT_SECTORS = [
    {
        name: "Sector Ropa",
        color: "#6366f1", // Indigo
        categories: ["Ropa Americana 1ra", "Lana y Ropa Artesanal", "Ropa Nueva"],
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
        color: "#f59e0b", // Amber
        categories: ["Comida - Food", "Abarrotes - Groceries"],
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
        color: "#64748b", // Slate
        categories: ["Auto partes 1ra", "Llantas-Tyres", "Herramientas - Tools"],
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
