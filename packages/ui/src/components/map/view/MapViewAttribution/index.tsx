'use client';

import styles from './styles.module.css';

/* * */

export function MapViewAttribution() {
	return (
		<div className={styles.attribution}>
			<a className={styles.link} href="https://maplibre.org/" target="_blank">MapLibre</a>
			<a className={styles.link} href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a>
			<a className={styles.link} href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>
		</div>
	);
}
