'use client';

import { useStopsListContext } from '@/contexts/StopsList.context';

import styles from './styles.module.css';

/* * */

export function Footer({ data, queryString }) {
	//

	//
	// A. Setup variables

	const filteredStops = data.stops.filter(stop => (queryString == null || stop.name.includes(queryString)) && stop.is_archived === false);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			Encontradas {filteredStops.length} paragens
		</div>
	);
}
