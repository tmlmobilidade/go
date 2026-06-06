'use client';

import { Marker } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayUserLocationProps {
	latitude?: number
	longitude?: number
	visible?: boolean
}

/* * */

export function MapViewOverlayUserLocation({ latitude, longitude, visible = true }: MapViewOverlayUserLocationProps) {
	if (!latitude || !longitude || !visible) {
		return null;
	}

	return (
		<Marker anchor="center" latitude={latitude} longitude={longitude}>
			<div className={styles.marker} aria-hidden>
				<span className={styles.background} />
				<span className={styles.ripple} />
				<span className={styles.dot} />
			</div>
		</Marker>
	);
}
