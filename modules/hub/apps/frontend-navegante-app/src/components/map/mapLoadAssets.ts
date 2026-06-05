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
	{ name: 'vehicle-ccfl-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-ccfl-default-light.png` },
	{ name: 'vehicle-cmet-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-cmet-default-light.png` },
	{ name: 'vehicle-cp-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-cp-default-light.png` },
	{ name: 'vehicle-fertagus-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-fertagus-default-light.png` },
	{ name: 'vehicle-mobi-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-mobi-default-light.png` },
	{ name: 'vehicle-mts-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-mts-default-light.png` },
	{ name: 'vehicle-tcb-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-tcb-default-light.png` },
	{ name: 'vehicle-ttsl-default-light', sdf: false, url: `${getBasePath()}/global/map/vehicles/vehicle-ttsl-default-light.png` },
	/* * */
	{ name: 'alert-icon-accident', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-accident.png` },
	{ name: 'alert-icon-barrier', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-barrier.png` },
	{ name: 'alert-icon-calendar', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-calendar.png` },
	{ name: 'alert-icon-emergency', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-emergency.png` },
	{ name: 'alert-icon-info', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-info.png` },
	{ name: 'alert-icon-megaphone', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-megaphone.png` },
	{ name: 'alert-icon-storm', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-storm.png` },
	{ name: 'alert-icon-tool', sdf: false, url: `${getBasePath()}/global/map/alerts/alert-icon-tool.png` },
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
