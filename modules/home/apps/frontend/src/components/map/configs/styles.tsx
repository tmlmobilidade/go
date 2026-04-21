/* * */

import { type StyleSpecification } from 'maplibre-gl';

/* * */

export type MapStyle = 'map' | 'satellite';

interface MapStyleConfig {
	label: string
	max_zoom: number
	min_zoom: number
	value: string | StyleSpecification
}

/* * */

export const MAP_STYLES: Record<MapStyle, MapStyleConfig> = {

	map: {
		label: 'Mapa',
		max_zoom: 18,
		min_zoom: 5,
		value: 'https://maps.carrismetropolitana.pt/styles/default/style.json',
	},

	satellite: {
		label: 'Satélite',
		max_zoom: 18,
		min_zoom: 5,
		value: {
			layers: [
				{
					id: 'simple-tiles',
					source: 'raster-tiles',
					type: 'raster',
				},
			],
			sources: {
				'raster-tiles': {
					attribution: 'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
					tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
					tileSize: 256,
					type: 'raster',
				},
			},
			version: 8,
		},
	},

};
