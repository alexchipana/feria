-- 1. Actualizar colores de sectores basados en categorías comunes
UPDATE public.sectors SET color = '#3b82f6' WHERE name ILIKE '%Ropa%Americana%'; -- Azul para Americana
UPDATE public.sectors SET color = '#f97316' WHERE name ILIKE '%Comida%';         -- Naranja para Comida
UPDATE public.sectors SET color = '#10b981' WHERE name ILIKE '%Abarrotes%';     -- Verde para Abarrotes
UPDATE public.sectors SET color = '#06b6d4' WHERE name ILIKE '%Celulares%';     -- Cian para Tecnología
UPDATE public.sectors SET color = '#eab308' WHERE name ILIKE '%Joyas%' OR name ILIKE '%Cholita%'; -- Dorado
UPDATE public.sectors SET color = '#ef4444' WHERE name ILIKE '%Bicicletas%';    -- Rojo para Bicicletas
UPDATE public.sectors SET color = '#64748b' WHERE name ILIKE '%Autos%' OR name ILIKE '%Herramientas%'; -- Gris

-- 2. Insertar una variedad de puestos (puntos) de ejemplo para diferentes categorías
-- Asegurarse de que las categorías coincidan con las de Categorias.txt
INSERT INTO public.stalls (name, category, description, lat, lng, opening_hours) VALUES 
('Puesto de Bicicletas El Rayo', 'Bicicletas', 'Reparación y venta de repuestos originales.', -16.4952, -68.1732, 'Domingos 08:00 - 17:00'),
('Antojitos Alteños', 'Comida', 'Las mejores empanadas de la zona.', -16.5025, -68.1885, 'Todo el día'),
('Importadora Tech-Point', 'Celulares', 'Celulares de última generación y accesorios.', -16.5015, -68.1875, 'Jueves y Domingos'),
('Zapatos Usados "Paso Firme"', 'Zapatos Americanos Usados', 'Calzado americano de primera calidad.', -16.5005, -68.1895, 'Domingos'),
('Polleras Doña Rosa', 'Ropa de Cholita', 'Trajes completos para la chola paceña.', -16.5035, -68.1925, 'Jueves y Domingos'),
('Repuestos "El Tuercas"', 'Auto partes', 'Especialidad en motores y suspensión.', -16.5055, -68.1905, 'Sábados y Domingos');

-- 3. Asegurar que el sector Bicicletas tenga su línea si se perdió
UPDATE public.sectors 
SET geojson = '{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-68.173525, -16.495295],
      [-68.173433, -16.495293],
      [-68.173263, -16.495239],
      [-68.173138, -16.495150],
      [-68.173063, -16.495045],
      [-68.172903, -16.495085]
    ]
  }
}'::jsonb
WHERE name LIKE '%Bicicletas%';
