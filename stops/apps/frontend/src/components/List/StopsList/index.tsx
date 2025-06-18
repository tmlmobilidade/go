'use client';

import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';

import { Item } from './Item';
import styles from './styles.module.css';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables
	const stopsContext = useStopsContext();
	const searchBarContext = useSearchbarContext();

	//
	// B. Transform Data
	const filteredStops = stopsContext.data.stops.filter(stop => (searchBarContext.queryString == null || stop.name.includes(searchBarContext.queryString)) && stop.is_archived === false);
	//
	// C. Render components
	return (
		<div className={styles.container}>
			{
				stopsContext.flags.is_loading
					? <div>Loading...</div>
					: filteredStops.map((stop, index) => (<Item key={index} stop={stop} />))
			}
		</div>
	);
}
