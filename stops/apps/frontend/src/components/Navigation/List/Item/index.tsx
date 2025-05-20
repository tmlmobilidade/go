'use client';

import { redirect, RedirectType } from 'next/navigation';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import Link from 'next/link';

import { Left } from './Left';
import { Right } from './Right';
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
				<Left
					_id={stop?._id}
					latitude={stop?.latitude}
					longitude={stop.longitude}
					name={stop.name}
				/>
				<Right />
			</div>
		</Link>
	);
}
