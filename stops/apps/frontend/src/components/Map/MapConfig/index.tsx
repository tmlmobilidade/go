//

//
// A. setup variables

// DEFAULTS FOR OSM MAP

// Locations
const defaultLat = 38.7;
const defaultLon = -9.1;

// Bearing, Pitch and Zoom
const defaultBearing = 0;
const defaultPicth = 0;
const defaultZoom = 9;

// Min and Max Zoom
const minZoom = 5;
const maxZoom = 18;

//
// MAP STYLES

const styleMap = 'https://maps.carrismetropolitana.pt/styles/default/style.json';

const styleSatellite = {
	layers: [
		{
			id: 'simple-tiles',
			source: 'raster-tiles',
			type: 'raster',
		},
	],
	sources: {
		'raster-tiles': {
			attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
			tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
			tileSize: 256,
			type: 'raster',
		},
	},
	version: 8,
};

//
// EXPORT SINGLE OBJECT

//

//
// Create the configuration object for the OSM Map

const config = {
	center: [defaultLon, defaultLat],
	initialViewState: { bearing: defaultBearing, latitude: defaultLat, longitude: defaultLon, pitch: defaultPicth, zoom: defaultZoom },
	maxZoom: maxZoom,
	minZoom: minZoom,
	styles: { default: styleMap, map: styleMap, satellite: styleSatellite },
	viewport: { bearing: defaultBearing, center: [defaultLon, defaultLat], pitch: defaultPicth, zoom: defaultZoom },
};

//

//
// B. Render componente
export default config;
