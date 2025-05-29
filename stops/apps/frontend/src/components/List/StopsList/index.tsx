'use client';

import { Item } from './Item';
import styles from './styles.module.css';

/* * */

export function StopsList({ data, flags, queryString }) {
	//
	console.log('data.stops', data.stops);
	//
	// A. Setup variables
	const filteredStops = data.stops.filter(stop => (queryString == null || stop.name.includes(queryString)) && stop.is_archived === false);
	//
	// B. Render components

	return (
		<div className={styles.container}>
			{
				flags.is_loading
					? <div>Loading...</div>
					: filteredStops.map((stop, index) => (<Item key={index} stop={stop} />))
			}
		</div>
	);
}
