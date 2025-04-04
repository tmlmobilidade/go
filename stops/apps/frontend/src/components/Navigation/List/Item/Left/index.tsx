'use client';

/* * */

import styles from './styles.module.css';

/* * */

interface LeftProps {
	id: string
	lat: number
	lon: number
	long_name: string
}

/* * */

export default function Left({ id, lat, lon, long_name }: LeftProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<p>{long_name}</p>
			<div className={styles.details}>
				<div className={styles.id}>{id}</div>
				<div className={styles.coords}>{lat} {lon}</div>
			</div>
		</div>
	);
}
