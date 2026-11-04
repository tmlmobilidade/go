'use client';

import { Marker } from '@vis.gl/react-maplibre';
import { useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayUserLocationProps {
	latitude?: number
	longitude?: number
	visible?: boolean
}

/* * */

export function MapViewOverlayUserLocation({ latitude, longitude, visible = true }: MapViewOverlayUserLocationProps) {
	const from = useRef<null | { latitude: number, longitude: number }>(null);
	const [position, setPosition] = useState(from.current);

	useEffect(() => {
		if (!latitude || !longitude) {
			from.current = null;
			return setPosition(null);
		}

		const start = from.current ?? { latitude, longitude };
		const startTime = performance.now();
		let frame = 0;

		const tick = (now: number) => {
			const t = Math.min((now - startTime) / 800, 1);
			const next = {
				latitude: start.latitude + (latitude - start.latitude) * t,
				longitude: start.longitude + (longitude - start.longitude) * t,
			};
			from.current = next;
			setPosition(next);
			if (t < 1) frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [latitude, longitude]);

	if (!position || !visible) return null;

	return (
		<Marker anchor="center" latitude={position.latitude} longitude={position.longitude}>
			<div className={styles.marker} aria-hidden>
				<span className={styles.background} />
				<span className={styles.ripple} />
				<span className={styles.dot} />
			</div>
		</Marker>
	);
}
