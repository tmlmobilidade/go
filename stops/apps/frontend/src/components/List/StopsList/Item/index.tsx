'use client';

import type { Stop } from '@tmlmobilidade/types';

import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface ItemProps {
	stop: Stop
}

/* * */

export function Item({ stop }: ItemProps) {
	//

	//
	// A. Render components

	return (
		<Link href={`/stops/${stop._id}`}>
			<div className={styles.container}>
				<div className={styles.section}>
					<p>{stop.name}</p>
					<div className={styles.details}>
						<div className={styles.id}>{stop._id}</div>
						<div className={styles.coords}>{stop.latitude} {stop.longitude}</div>
					</div>
				</div>

				<div className={styles.section}>
					<IconChevronRight />
				</div>
			</div>
		</Link>
	);
}
