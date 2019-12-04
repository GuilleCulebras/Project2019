'use strict'



function execute(){
  var map = new mapboxgl.Map({
      container: 'map', // id del elemento HTML que contendrá el mapa
      style: 'http://xxx.xxx.com:8080/styles/osm-bright/style.json', // Ubicación del estilo
      center: [0,0], // Ubicación inicial
      zoom: 2, // Zoom inicial // Ángulo de rotación inicial
      //hash: true // Permite ir guardando la posición del mapa en la URL
  });



  airportDatabaseQuery(map);

  // Agrega controles de navegación (zoom, rotación) al mapa:
  map.addControl(new mapboxgl.NavigationControl());

  // console.log(geojson);
  // add markers to map
  //var marker = new mapboxgl.Marker().setLngLat([-63.29223632812499,-18.28151823530889]).addTo(map);
  //var marker = new mapboxgl.Marker().setLngLat([-65.017, -16.457]).addTo(map);
}

function airportTimeTableQuery(iataCode, type) {
  let request = require('request');

  let dir_base = 'http://aviation-edge.com/v2/public/timetable?';

  let param1 = 'key=8af1a5-06b638&';

  let param2 = 'iataCode=' + iataCode + '&type=' + type;

  let uri = dir_base + param1 + param2;

  request.get(uri, function(error, response, body){
    console.log("error:");
    console.log(error);
    console.log("Body:");
    print1(body);
  });
}

function flightTrackerQuery(type, value) {
/*
type:
&depIata=Departure airport IATA code
&depIcao=Departure airport ICAO code
&arrIata=Arrival airport IATA code
&arrIcao=Arrival airport ICAO code
&aircraftIcao=Aircraft ICAO code
&regNum=Aircraft registration number
&aircraftIcao24=Aircraft ICAO24 code
&airlineIata=Airline IATA code
&airlineIcao=Airline ICAO code
&flightIata=Flight IATA code
&flightIcao=Flight ICAO code
&flightNum=Flight number
&status=Status of the flight (started, en-route, landed, unknown)
&limit=Limit value for output
*/

  let request = require('request');

  let dir_base = 'http://aviation-edge.com/v2/public/flights?';

  let param1 = 'key=8af1a5-06b638&';

  let param2 = type + '=' + value;  // flightIata=W8519

  let uri = dir_base + param1 + param2;

  request.get(uri, function(error, response, body){
    console.log("error:");
    console.log(error);
    console.log("Body:");
    print2(body);
  });
}

async function airportDatabaseQuery(map) {

  let dir_base = 'https://aviation-edge.com/v2/public/airportDatabase?key=8af1a5-06b638';
  var response;
  let arrayAirports = [];
  let res;

  var geojsonAirports = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [] //coordenadas aqui
      },
      properties: {
        title: null, //Codigo iata aqui
        description: null // nombre aeropuerto aqui
      }
    }]
  };

  try {
    response = await axios.get(dir_base);
  } catch (error) {
    console.error(error);
  }

  res = await response.data;

  console.log(res.length);
  for (var i = 0; i < res.length; i++) {
    let x=  {
      airportId:res[i].airportId,
      codeIataAirport:res[i].codeIataAirport,
      nameAirport:res[i].nameAirport,
      latitudeAirport:res[i].latitudeAirport,
      longitudeAirport:res[i].longitudeAirport,
      codeIcaoAirport:res[i].codeIcaoAirport,
    };
    if (res[i].codeIcaoAirport  !== "") {
      if (res[i].latitudeAirport !== "0" && res[i].longitudeAirport !== "0") {
        arrayAirports.push(x);
      }
    }
  }
  console.log(arrayAirports.length);
  for (var i = 0; i < arrayAirports.length; i++) {

        geojsonAirports.features[i].geometry.coordinates[0] = arrayAirports[i].longitudeAirport;
        geojsonAirports.features[i].geometry.coordinates[1] = arrayAirports[i].latitudeAirport;
        geojsonAirports.features[i].properties.title = arrayAirports[i].codeIataAirport;
        geojsonAirports.features[i].properties.description = arrayAirports[i].nameAirport;

        geojsonAirports.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [] //coordenadas aqui
          },
          properties: {
            title: null, //Codigo iata aqui
            description: null // nombre aeropuerto aqui
          }
        });
    }

   geojsonAirports.features.forEach(function(marker) {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';
    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
      .addTo(map);
  });

}

function generateArrayAirports(y){
  let array = [];
  for (var i = 0; i < y.length; i++) {
    let x={
      airportId:y[i].airportId,
      codeIataAirport:y[i].codeIataAirport,
      nameAirport:y[i].nameAirport,
      latitudeAirport:y[i].latitudeAirport,
      longitudeAirport:y[i].longitudeAirport,
    };
    array.push(x);
  }
  return array;
  // for (var i = 0; i < array.length; i++) {
  //   console.log(array[i].codeIataAirport);
  // }
}

function print2(x) {
  let y=JSON.parse(x);
  console.log(y);
}

function print1(x) {
  let y=JSON.parse(x);
  let departureTime;
  console.log(departureTime);
  for (let i = 0; i < y.length; i++) {
    departureTime = y[i].departure.scheduledTime;
    console.log(departureTime);
  }
}


function test() {
  //let iataCode = 'JFK';
  //let type = 'departure';
  //airportTimeTableQuery(iataCode,type);
  let type='depIata';
  let value= 'MAD';

  //flightTrackerQuery(type,value);

  airportDatabaseQuery();
}
