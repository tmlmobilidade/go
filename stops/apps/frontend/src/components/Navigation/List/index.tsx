'use client';

/* * */

import { useStopsContext } from '@/contexts/Stops.context';

/* * */

import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopDetailContext } from '@/contexts/StopDetail.context';

import Item from './Item';
import styles from './styles.module.css';

/* * */

export default function List() {
	//

	//
	// A. Setup variables

	const { data, flags } = useStopsContext();

	const searchbarContext = useSearchbarContext();

	const filteredStops = data.stops.filter(stop => searchbarContext.queryString == null || stop.name.includes(searchbarContext.queryString));
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
