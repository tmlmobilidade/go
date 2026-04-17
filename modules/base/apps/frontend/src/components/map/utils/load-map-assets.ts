/* * */

import { type Map as MapLibreMap } from 'maplibre-gl';

/* * */

const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: `/map/map-pin.png` },
	{ name: 'map-line-direction', sdf: true, url: `/map/map-line-direction.png` },
	{ name: 'map-line-direction-offset', sdf: true, url: `/map/map-line-direction-offset.png` },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: `/map/map-line-direction-offset-padding.png` },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: `/map/bus-delay.png` },
	{ name: 'cmet-bus-regular', sdf: false, url: `/map/bus-regular.png` },
	{ name: 'cmet-bus-cut', sdf: false, url: `/map/bus-cut.png` },
	{ name: 'cmet-bus-error', sdf: false, url: `/map/bus-error.png` },
	/* * */
	{ name: 'ttsl-boat-regular', sdf: false, url: `/map/boat-regular.png` },
	/* * */
	{ name: 'carris-bus-regular', sdf: false, url: `/map/bus-carris.png` },
	/* * */
	{ name: 'mobi-bus-regular', sdf: false, url: `/map/bus-mobi.png` },
];

/**
 * Loads map assets into the specified map object.
 * @param mapObject The map object to load assets into.
 */
export function loadMapAssets(mapObject: MapLibreMap | null | undefined) {
	if (!mapObject) return;
	for (const mapLoadAsset of MAP_LOAD_ASSETS) {
		mapObject.loadImage(mapLoadAsset.url).then((image) => {
			mapObject.addImage(mapLoadAsset.name, image.data, { sdf: mapLoadAsset.sdf });
		});
	}
}
