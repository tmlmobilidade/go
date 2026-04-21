/* * */

import type { StaticImageData } from 'next/image';

import { type Map } from 'maplibre-gl';

import boatRegular from '../../../app/assets/map/boat-regular.png';
import busCarris from '../../../app/assets/map/bus-carris.png';
import busCut from '../../../app/assets/map/bus-cut.png';
import busDelay from '../../../app/assets/map/bus-delay.png';
import busError from '../../../app/assets/map/bus-error.png';
import busMobi from '../../../app/assets/map/bus-mobi.png';
import busRegular from '../../../app/assets/map/bus-regular.png';
import mapLineDirectionOffsetPadding from '../../../app/assets/map/map-line-direction-offset-padding.png';
import mapLineDirectionOffset from '../../../app/assets/map/map-line-direction-offset.png';
import mapLineDirection from '../../../app/assets/map/map-line-direction.png';
import mapPin from '../../../app/assets/map/map-pin.png';

/* * */

function imageUrl(src: StaticImageData | string): string {
	return typeof src === 'string' ? src : src.src;
}

const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: imageUrl(mapPin) },
	{ name: 'map-line-direction', sdf: true, url: imageUrl(mapLineDirection) },
	{ name: 'map-line-direction-offset', sdf: true, url: imageUrl(mapLineDirectionOffset) },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: imageUrl(mapLineDirectionOffsetPadding) },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: imageUrl(busDelay) },
	{ name: 'cmet-bus-regular', sdf: false, url: imageUrl(busRegular) },
	{ name: 'cmet-bus-cut', sdf: false, url: imageUrl(busCut) },
	{ name: 'cmet-bus-error', sdf: false, url: imageUrl(busError) },
	/* * */
	{ name: 'ttsl-boat-regular', sdf: false, url: imageUrl(boatRegular) },
	/* * */
	{ name: 'carris-bus-regular', sdf: true, url: imageUrl(busCarris) },
	/* * */
	{ name: 'mobi-bus-regular', sdf: false, url: imageUrl(busMobi) },
];

/**
 * Loads map assets into the specified map object.
 * @param mapObject The map object to load assets into.
 */
export function loadMapAssets(mapObject: Map) {
	if (!mapObject) return;
	for (const mapLoadAsset of MAP_LOAD_ASSETS) {
		mapObject.loadImage(mapLoadAsset.url).then((image) => {
			mapObject.addImage(mapLoadAsset.name, image.data, { sdf: mapLoadAsset.sdf });
		});
	}
}
