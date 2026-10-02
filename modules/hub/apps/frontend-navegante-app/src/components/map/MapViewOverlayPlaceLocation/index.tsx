'use client';

import { IconDirections } from '@tabler/icons-react';
import { Marker } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayPlaceLocationProps {
	directionsLabel?: string
	latitude?: number
	longitude?: number
	onDirections?: () => void
	visible?: boolean
}

/* * */

export function MapViewOverlayPlaceLocation({ directionsLabel, latitude, longitude, onDirections, visible = true }: MapViewOverlayPlaceLocationProps) {
	if (!visible || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

	return (
		<Marker anchor="bottom" latitude={latitude as number} longitude={longitude as number}>
			<div className={styles.container}>
				{onDirections && directionsLabel && (
					<div className={styles.tooltip}>
						<button className={styles.directionsButton} onClick={onDirections} type="button">
							<IconDirections aria-hidden="true" size={22} stroke={2.25} />
							{directionsLabel}
						</button>
					</div>
				)}

				<div className={styles.marker} aria-hidden>
					<span className={styles.pin}>
						<span className={styles.dot} />
					</span>
				</div>
			</div>
		</Marker>
	);
}
