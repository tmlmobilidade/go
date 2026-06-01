/* * */

import { getBasePath } from '@tmlmobilidade/ui';

/* * */

const asset = (filename: string) => `${getBasePath()}/global/map/${filename}`;

/* * */

export const MAP_LOAD_ASSETS = [
	{ name: 'map-pin', sdf: false, url: asset('map-pin.png') },
	{ name: 'map-line-direction', sdf: true, url: asset('map-line-direction.png') },
	{ name: 'map-line-direction-offset', sdf: true, url: asset('map-line-direction-offset.png') },
	{ name: 'map-line-direction-offset-padding', sdf: true, url: asset('map-line-direction-offset-padding.png') },
	/* * */
	{ name: 'icon-car-crash', sdf: false, url: asset('car-crash.png') },
	{ name: 'icon-barrier-block', sdf: false, url: asset('barrier-block.png') },
	{ name: 'icon-speakerphone', sdf: false, url: asset('speakerphone.png') },
	{ name: 'icon-calendar-event', sdf: false, url: asset('calendar-event.png') },
	{ name: 'icon-tool', sdf: false, url: asset('tool.png') },
	{ name: 'icon-ambulance', sdf: false, url: asset('ambulance.png') },
	{ name: 'icon-cloud-storm', sdf: false, url: asset('cloud-storm.png') },
	{ name: 'icon-info-triangle', sdf: false, url: asset('info-triangle.png') },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: asset('bus-delay.png') },
	{ name: 'cmet-bus-regular', sdf: false, url: asset('bus-regular.png') },
	{ name: 'cmet-bus-cut', sdf: false, url: asset('bus-cut.png') },
	{ name: 'ttsl-boat-regular', sdf: false, url: asset('boat-regular.png') },
	{ name: 'carris-bus-regular', sdf: true, url: asset('bus-carris.png') },
	{ name: 'mobi-bus-regular', sdf: false, url: asset('bus-mobi.png') },
	{ name: 'cmet-bus-error', sdf: false, url: asset('bus-error.png') },
	{ name: 'cmet-needle-pin', sdf: false, url: asset('needle-pin.png') },
	{ name: 'cmet-shape-direction', sdf: true, url: asset('shape-direction.png') },
	{ name: 'cmet-stop-selected', sdf: false, url: asset('stop-selected.png') },
	{ name: 'cmet-store-busy', sdf: false, url: asset('store-busy.png') },
	{ name: 'cmet-store-closed', sdf: false, url: asset('store-closed.png') },
	{ name: 'cmet-store-open', sdf: false, url: asset('store-open.png') },
];
