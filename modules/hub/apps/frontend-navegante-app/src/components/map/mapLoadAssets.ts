/* * */

import { type Map as MapLibreMap } from 'maplibre-gl';

/* * */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function mapAssetUrl(path: string) {
	return `${BASE_PATH}${path}`;
}

/* * */

export const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: mapAssetUrl('/global/map/map-pin.png') },
	{ name: 'map-line-direction', sdf: true, url: mapAssetUrl('/global/map/map-line-direction.png') },
	{ name: 'map-line-direction-offset', sdf: true, url: mapAssetUrl('/global/map/map-line-direction-offset.png') },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: mapAssetUrl('/global/map/map-line-direction-offset-padding.png') },
	/* * */
	{ name: 'icon-car-crash', sdf: false, url: mapAssetUrl('/global/map/car-crash.png') },
	{ name: 'icon-barrier-block', sdf: false, url: mapAssetUrl('/global/map/barrier-block.png') },
	{ name: 'icon-speakerphone', sdf: false, url: mapAssetUrl('/global/map/speakerphone.png') },
	{ name: 'icon-calendar-event', sdf: false, url: mapAssetUrl('/global/map/calendar-event.png') },
	{ name: 'icon-tool', sdf: false, url: mapAssetUrl('/global/map/tool.png') },
	{ name: 'icon-ambulance', sdf: false, url: mapAssetUrl('/global/map/ambulance.png') },
	{ name: 'icon-cloud-storm', sdf: false, url: mapAssetUrl('/global/map/cloud-storm.png') },
	{ name: 'icon-info-triangle', sdf: false, url: mapAssetUrl('/global/map/info-triangle.png') },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: mapAssetUrl('/global/map/bus-delay.png') },
	{ name: 'cmet-bus-regular', sdf: false, url: mapAssetUrl('/global/map/bus-regular.png') },
	{ name: 'cmet-bus-cut', sdf: false, url: mapAssetUrl('/global/map/bus-cut.png') },
	{ name: 'ttsl-boat-regular', sdf: false, url: mapAssetUrl('/global/map/boat-regular.png') },
	{ name: 'carris-bus-regular', sdf: true, url: mapAssetUrl('/global/map/bus-carris.png') },
	{ name: 'mobi-bus-regular', sdf: false, url: mapAssetUrl('/global/map/bus-mobi.png') },
	{ name: 'cmet-bus-error', sdf: false, url: mapAssetUrl('/global/map/bus-error.png') },
	{ name: 'cmet-needle-pin', sdf: false, url: mapAssetUrl('/global/map/needle-pin.png') },
	{ name: 'cmet-shape-direction', sdf: true, url: mapAssetUrl('/global/map/shape-direction.png') },
	{ name: 'cmet-stop-selected', sdf: false, url: mapAssetUrl('/global/map/stop-selected.png') },
	{ name: 'cmet-store-busy', sdf: false, url: mapAssetUrl('/global/map/store-busy.png') },
	{ name: 'cmet-store-closed', sdf: false, url: mapAssetUrl('/global/map/store-closed.png') },
	{ name: 'cmet-store-open', sdf: false, url: mapAssetUrl('/global/map/store-open.png') },
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
