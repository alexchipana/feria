const https = require('https');
const fs = require('fs');

const query = `[out:json];way[highway](-16.515,-68.195,-16.490,-68.160);out geom;`;
const data = 'data=' + encodeURIComponent(query);

const options = {
    hostname: 'overpass-api.de',
    port: 443,
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(responseData);
            fs.writeFileSync('osm_feria.json', JSON.stringify(json, null, 2));
            console.log('OSM data saved to osm_feria.json');
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Response content:', responseData.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write(data);
req.end();
