'use client';

import { Marker } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

export type UserLocationCoordinates = [longitude: number, latitude: number];

interface MapViewOverlayUserLocationProps {
	location?: null | UserLocationCoordinates
	visible?: boolean
}

/* * */

export function MapViewOverlayUserLocation({ location, visible = true }: MapViewOverlayUserLocationProps) {
	if (!location || !visible) {
		return null;
	}

	const [longitude, latitude] = location;

	return (
		<Marker anchor="center" latitude={latitude} longitude={longitude}>
			<div aria-hidden className={styles.marker}>
				<span className={styles.ripple} />
				<span className={styles.ripple} />
				<span className={styles.dot} />
			</div>
		</Marker>
	);
}
