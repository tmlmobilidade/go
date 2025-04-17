'use client';

import { redirect, RedirectType } from 'next/navigation';

/* * */

import type { Stop } from '@tmlmobilidade/types';

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
		<div className={styles.container} onClick={() => redirect(stop._id, RedirectType.replace)}>
			<Left
				_id={stop?._id}
				latitude={stop?.latitude}
				longitude={stop.longitude}
				name={stop.name}
			/>
			<Right />
		</div>
	);
}
