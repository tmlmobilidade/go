'use client';

import { Marker } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayPlaceLocationProps {
	latitude?: number
	longitude?: number
	visible?: boolean
}

/* * */

export function MapViewOverlayPlaceLocation({ latitude, longitude, visible = true }: MapViewOverlayPlaceLocationProps) {
	if (!visible || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

	return (
		<Marker anchor="bottom" latitude={latitude as number} longitude={longitude as number}>
			<div aria-hidden className={styles.marker}>
				<span className={styles.pin}>
					<span className={styles.dot} />
				</span>
			</div>
		</Marker>
	);
}
