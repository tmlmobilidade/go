'use client';

/* * */

import { Path } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnDistance({ pathItem, rowIndex }: { pathItem: Path, rowIndex: number }) {
	//

	//
	// A. Transform data

	const distanceDeltaFormatted = useMemo(() => {
		if (rowIndex === 0 || !pathItem.distance_delta) return '0 metros';

		if (pathItem.distance_delta >= 1000) {
			const distanceInKm = Math.floor(pathItem.distance_delta / 1000);
			const remainderInMeters = pathItem.distance_delta % 1000;
			return `${distanceInKm} km ${remainderInMeters} metros`;
		}

		return `${pathItem.distance_delta} metros`;
	}, [pathItem.distance_delta, rowIndex]);

	//
	// B. Render components

	return (
		<div className={styles.column}>
			<span className={styles.distanceValue}>{distanceDeltaFormatted}</span>
		</div>
	);

	//
}
