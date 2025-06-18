'use client';

import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';

import styles from './styles.module.css';

/* * */

export function Footer() {
	//

	//
	// A. Setup variables
	const stopsContext = useStopsContext();
	const seachBarContext = useSearchbarContext(); ;

	//
	// B. Transform Data
	const filteredStops = stopsContext.data.stops.filter(stop => (seachBarContext.queryString == null || stop.name.includes(seachBarContext.queryString)) && stop.is_archived === false);

	//
	// C. Render components
	return (
		<div className={styles.container}>
			Encontradas {filteredStops.length} paragens
		</div>
	);
}
