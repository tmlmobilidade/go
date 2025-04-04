'use client';

/* * */

import type { Stop } from '@carrismetropolitana/api-types/network';

/* * */

import Left from './Left';
import Right from './Right';
import styles from './styles.module.css';

/* * */

interface ItemProps {
	stop: Stop
}

/* * */

export default function Item({ stop }: ItemProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<Left id={stop.id} lat={stop.lat} lon={stop.lon} long_name={stop.long_name} />
			<Right />
		</div>
	);
}
