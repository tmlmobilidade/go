'use client';

import MapContainer from '../MapContainer';
import styles from '../styles.module.css';

/* * */

export default function GenericContainer() {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<MapContainer generic={true} />
		</div>
	);
}
