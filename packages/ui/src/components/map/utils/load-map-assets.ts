/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { type Map as MapLibreMap } from 'maplibre-gl';

/* * */

const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: `${getAppConfig('auth', 'frontend_url')}/global/map/map-pin.png` },
	{ name: 'map-line-direction', sdf: true, url: `${getAppConfig('auth', 'frontend_url')}/global/map/map-line-direction.png` },
	{ name: 'map-line-direction-offset', sdf: true, url: `${getAppConfig('auth', 'frontend_url')}/global/map/map-line-direction-offset.png` },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: `${getAppConfig('auth', 'frontend_url')}/global/map/map-line-direction-offset-padding.png` },
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
