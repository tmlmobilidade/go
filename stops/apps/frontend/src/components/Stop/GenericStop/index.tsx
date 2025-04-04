'use client';

/* * */

import type { Stop } from '@carrismetropolitana/api-types/network';

/* * */

import MapContainer from '../MapContainer';
import styles from '../styles.module.css';

/* * */

export default function Stop() {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<MapContainer generic={true} />
		</div>
	);
}
