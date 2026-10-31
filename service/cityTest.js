const NodeGeocoder = require('node-geocoder');
const optionsEn = {
    provider: 'google',
    apiKey: 'AIzaSyCq3i5-3KPewMAoHBCSR2NHw174LoQXppI', // for Mapquest, OpenCage, Google Premier
    formatter: null, // 'gpx', 'string', ...
    language: "en"
};


const lat = 18.23059806278533, lng = 42.551111318171024;

async function run(){
    console.log(lat, lng);
    const geocoderEn = NodeGeocoder(optionsEn);

    const resEn = await geocoderEn.reverse({ lat, lon:lng });
    console.log(resEn);
    console.log(resEn[0].city)
    
    const cityNameEn = resEn[0].administrativeLevels.level2short;
    console.log(cityNameEn);
    
}

run();