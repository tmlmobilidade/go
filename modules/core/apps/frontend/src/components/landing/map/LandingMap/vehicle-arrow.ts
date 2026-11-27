'use client';

import { type MapRef } from '@vis.gl/react-maplibre';
import { useEffect, useState } from 'react';

/* * */

export const VEHICLE_ARROW_IMAGE = 'landing-vehicle-arrow';

const FALLBACK_COLOR = '#005adc';

/** Path of Tabler's `IconNavigationFilled` (24×24 viewBox, pointing north). */
const TABLER_NAVIGATION_FILLED_PATH = 'M11.092 2.581a1 1 0 0 1 1.754 -.116l.062 .116l8.005 17.365c.198 .566 .05 1.196 -.378 1.615a1.53 1.53 0 0 1 -1.459 .393l-7.077 -2.398l-6.899 2.338a1.535 1.535 0 0 1 -1.52 -.231l-.112 -.1c-.398 -.386 -.556 -.954 -.393 -1.556l.047 -.15l7.97 -17.276z';
const PIXEL_RATIO = 2;
const SIZE = 24;

/* * */

/**
 * Reads `--color-primary` and re-reads it whenever the theme or color mode changes,
 * since MapLibre paint properties cannot consume CSS variables.
 */
export function usePrimaryColor() {
	const [color, setColor] = useState(FALLBACK_COLOR);

	useEffect(() => {
		const read = () => setColor(getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || FALLBACK_COLOR);
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, { attributeFilter: ['data-theme', 'data-mode'], attributes: true });
		return () => observer.disconnect();
	}, []);

	return color;
}

/* * */

/**
 * Draws the north-pointing navigation icon filled with `color` and registers it on the map,
 * replacing the previous image so a theme change recolors every arrow.
 */
export function setVehicleArrowImage(map: ReturnType<MapRef['getMap']>, color: string) {
	const canvas = document.createElement('canvas');
	canvas.width = SIZE * PIXEL_RATIO;
	canvas.height = SIZE * PIXEL_RATIO;
	const context = canvas.getContext('2d');
	if (!context) return;

	context.scale(PIXEL_RATIO, PIXEL_RATIO);
	const path = new Path2D(TABLER_NAVIGATION_FILLED_PATH);
	context.fillStyle = color;
	context.fill(path);
	context.lineJoin = 'round';
	context.lineWidth = 1.25;
	context.strokeStyle = '#ffffff';
	context.stroke(path);

	const image = context.getImageData(0, 0, canvas.width, canvas.height);
	if (map.hasImage(VEHICLE_ARROW_IMAGE)) map.updateImage(VEHICLE_ARROW_IMAGE, image);
	else map.addImage(VEHICLE_ARROW_IMAGE, image, { pixelRatio: PIXEL_RATIO });
}
