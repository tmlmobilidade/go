'use client';

import { type UserLocationCoordinates } from '@/components/common/base-map/use-user-location';
import { Marker } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayUserLocationProps {
	coordinates?: null | UserLocationCoordinates
	visible?: boolean
}

/* * */

export function MapViewOverlayUserLocation({ coordinates, visible = true }: MapViewOverlayUserLocationProps) {
	if (!coordinates || !visible) {
		return null;
	}

	return (
		<Marker anchor="center" latitude={coordinates[1]} longitude={coordinates[0]}>
			<div className={styles.marker} aria-hidden>
				<span className={styles.ripple} />
				<span className={styles.ripple} />
				<span className={styles.dot} />
			</div>
		</Marker>
	);
}
