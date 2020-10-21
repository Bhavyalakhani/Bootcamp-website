const NodeGeocoder = require('node-geocoder');

const options ={
    provider :"mapquest",
    httpAdapter : 'https',
    apiKey:"v2ATlHMsxsBag4lkeG8MlqXA8AxcBAfI",
    formatter:null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;