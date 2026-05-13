import { imageAssetUrl } from '@/utils/imageAssetUrl';
import ambulance from '@assets/global/map/ambulance.png';
import barrierBlock from '@assets/global/map/barrier-block.png';
import boatRegular from '@assets/global/map/boat-regular.png';
import busCarris from '@assets/global/map/bus-carris.png';
import busCut from '@assets/global/map/bus-cut.png';
import busDelay from '@assets/global/map/bus-delay.png';
import busError from '@assets/global/map/bus-error.png';
import busMobi from '@assets/global/map/bus-mobi.png';
import busRegular from '@assets/global/map/bus-regular.png';
import calendarEvent from '@assets/global/map/calendar-event.png';
import carCrash from '@assets/global/map/car-crash.png';
import cloudStorm from '@assets/global/map/cloud-storm.png';
import infoTriangle from '@assets/global/map/info-triangle.png';
import needlePin from '@assets/global/map/needle-pin.png';
import shapeDirection from '@assets/global/map/shape-direction.png';
import speakerphone from '@assets/global/map/speakerphone.png';
import stopSelected from '@assets/global/map/stop-selected.png';
import storeBusy from '@assets/global/map/store-busy.png';
import storeClosed from '@assets/global/map/store-closed.png';
import storeOpen from '@assets/global/map/store-open.png';
import tool from '@assets/global/map/tool.png';

/* * */

const u = imageAssetUrl;

export const MAP_LOAD_ASSETS = [
	{ name: 'icon-car-crash', sdf: false, url: u(carCrash) },
	{ name: 'icon-barrier-block', sdf: false, url: u(barrierBlock) },
	{ name: 'icon-speakerphone', sdf: false, url: u(speakerphone) },
	{ name: 'icon-calendar-event', sdf: false, url: u(calendarEvent) },
	{ name: 'icon-tool', sdf: false, url: u(tool) },
	{ name: 'icon-ambulance', sdf: false, url: u(ambulance) },
	{ name: 'icon-cloud-storm', sdf: false, url: u(cloudStorm) },
	{ name: 'icon-info-triangle', sdf: false, url: u(infoTriangle) },
	/* * */
	{ name: 'cmet-bus-delay', sdf: false, url: u(busDelay) },
	{ name: 'cmet-bus-regular', sdf: false, url: u(busRegular) },
	{ name: 'cmet-bus-cut', sdf: false, url: u(busCut) },
	{ name: 'ttsl-boat-regular', sdf: false, url: u(boatRegular) },
	{ name: 'carris-bus-regular', sdf: true, url: u(busCarris) },
	{ name: 'mobi-bus-regular', sdf: false, url: u(busMobi) },
	{ name: 'cmet-bus-error', sdf: false, url: u(busError) },
	{ name: 'cmet-needle-pin', sdf: false, url: u(needlePin) },
	{ name: 'cmet-shape-direction', sdf: true, url: u(shapeDirection) },
	{ name: 'cmet-stop-selected', sdf: false, url: u(stopSelected) },
	{ name: 'cmet-store-busy', sdf: false, url: u(storeBusy) },
	{ name: 'cmet-store-closed', sdf: false, url: u(storeClosed) },
	{ name: 'cmet-store-open', sdf: false, url: u(storeOpen) },
];
