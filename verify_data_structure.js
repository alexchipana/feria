
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkehvmfbzibpbgzdkdky.supabase.co';
const supabaseKey = 'sb_publishable_zjO4WcZdHQOkeRbsz3zKhA_ITt2eHFy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Fetching 'Sector Ropa'...");
    const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('name', 'Sector Ropa')
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data structure type:", data.geojson.type);
        console.log("Is FeatureCollection?", data.geojson.type === 'FeatureCollection');
        if (data.geojson.features && data.geojson.features.length > 0) {
            console.log("First feature geometry:", data.geojson.features[0].geometry);
            console.log("First feature properties:", data.geojson.features[0].properties);
        } else {
            console.log("No features found or not a FeatureCollection");
            console.log(JSON.stringify(data.geojson, null, 2).substring(0, 500));
        }
    }
}

check();
