'use client';

/* * */

import { Item } from './Item';
import styles from './styles.module.css';

/* * */

export function List({ data, flags, queryString }) {
	//

	//
	// A. Setup variables
	const filteredStops = data.stops.filter(stop => queryString == null || stop.name.includes(searchbarContext.queryString));
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
