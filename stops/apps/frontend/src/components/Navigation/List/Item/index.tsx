'use client';

/* * */

import type { Stop } from '@carrismetropolitana/api-types/network';

/* * */

import { IconChevronRight } from '@tabler/icons-react';

/* * */

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
			{/* Left Side */}
			<div className={styles.container_info}>
				<p className={styles.name}>{stop.long_name}</p>
				<div className={styles.details}>
					<div className={styles.id}>{stop.id}</div>
					<div className={styles.coords}>{stop.lat} {stop.lon}</div>
				</div>
			</div>

			{/* Right Side */}
			<div className={styles.container_icon}>
				<IconChevronRight />
			</div>
		</div>
	);
}
