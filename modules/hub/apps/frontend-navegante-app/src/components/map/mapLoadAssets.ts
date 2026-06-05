/* * */

import { getBasePath } from '@tmlmobilidade/ui';
import { type Map as MapLibreMap } from 'maplibre-gl';

/* * */

export const MAP_LOAD_ASSETS = [
	/* * */
	{ name: 'map-pin', sdf: false, url: `${getBasePath()}/global/map/map-pin.png` },
	{ name: 'map-line-direction', sdf: true, url: `${getBasePath()}/global/map/map-line-direction.png` },
	{ name: 'map-line-direction-offset', sdf: true, url: `${getBasePath()}/global/map/map-line-direction-offset.png` },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: `${getBasePath()}/global/map/map-line-direction-offset-padding.png` },
	/* * */
	{ name: 'ccfl-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/ccfl-vehicle-default-light.png` },
	{ name: 'cmet-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/cmet-vehicle-default-light.png` },
	{ name: 'mobi-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/mobi-vehicle-default-light.png` },
	{ name: 'tcb-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/tcb-vehicle-default-light.png` },
	{ name: 'ttsl-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/ttsl-vehicle-default-light.png` },
	{ name: 'fertagus-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/fertagus-vehicle-default-light.png` },
	{ name: 'mts-vehicle-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/mts-vehicle-default-light.png` },
	/* * */
	{ name: 'cmet-needle-pin', sdf: false, url: `${getBasePath()}/global/map/needle-pin.png` },
	{ name: 'cmet-shape-direction', sdf: true, url: `${getBasePath()}/global/map/shape-direction.png` },
	{ name: 'cmet-stop-selected', sdf: false, url: `${getBasePath()}/global/map/stop-selected.png` },
	{ name: 'cmet-store-busy', sdf: false, url: `${getBasePath()}/global/map/store-busy.png` },
	{ name: 'cmet-store-closed', sdf: false, url: `${getBasePath()}/global/map/store-closed.png` },
	{ name: 'cmet-store-open', sdf: false, url: `${getBasePath()}/global/map/store-open.png` },
];

/* * */

export function loadMapAssets(mapObject: MapLibreMap | null | undefined) {
	if (!mapObject) return;
	for (const mapLoadAsset of MAP_LOAD_ASSETS) {
		if (mapObject.hasImage(mapLoadAsset.name)) continue;
		mapObject.loadImage(mapLoadAsset.url).then((image) => {
			if (!mapObject.hasImage(mapLoadAsset.name)) {
				mapObject.addImage(mapLoadAsset.name, image.data, { sdf: mapLoadAsset.sdf });
			}
		});
	}
}
