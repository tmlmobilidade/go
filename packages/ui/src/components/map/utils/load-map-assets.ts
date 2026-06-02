/* * */

import { type Map as MapLibreMap } from 'maplibre-gl';

import { getBasePath } from '../../../utils/get-base-path';

/* * */

const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: `${getBasePath()}/global/map/map-pin.png` },
	{ name: 'map-line-direction', sdf: true, url: `${getBasePath()}/global/map/map-line-direction.png` },
	{ name: 'map-line-direction-offset', sdf: true, url: `${getBasePath()}/global/map/map-line-direction-offset.png` },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: `${getBasePath()}/global/map/map-line-direction-offset-padding.png` },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: `${getBasePath()}/global/map/bus-delay.png` },
	{ name: 'cmet-bus-regular', sdf: false, url: `${getBasePath()}/global/map/bus-regular.png` },
	{ name: 'cmet-bus-cut', sdf: false, url: `${getBasePath()}/global/map/bus-cut.png` },
	{ name: 'cmet-bus-error', sdf: false, url: `${getBasePath()}/global/map/bus-error.png` },
	/* * */
	{ name: 'ttsl-boat-regular', sdf: false, url: `${getBasePath()}/global/map/boat-regular.png` },
	{ name: 'carris-bus-regular', sdf: true, url: `${getBasePath()}/global/map/bus-carris.png` },
	{ name: 'mobi-bus-regular', sdf: false, url: `${getBasePath()}/global/map/bus-mobi.png` },
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
