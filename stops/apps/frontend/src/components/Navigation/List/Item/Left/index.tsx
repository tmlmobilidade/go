'use client';

/* * */

import styles from './styles.module.css';

/* * */

interface LeftProps {
	_id: string
	latitude: number
	longitude: number
	name: string
}

/* * */

export default function Left({ _id, latitude, longitude, name }: LeftProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<p>{name}</p>
			<div className={styles.details}>
				<div className={styles.id}>{_id}</div>
				<div className={styles.coords}>{latitude} {longitude}</div>
			</div>
		</div>
	);
}
