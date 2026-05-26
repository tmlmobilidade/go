'use client';

import { useStopsContext } from '@/contexts/Stops.context';

import styles from './styles.module.css';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{stopsContext.data.stops.map((stop, index) => (
				<div key={index} className={styles.item}>
					{stop.id} - {stop.long_name}
				</div>
			))}
		</div>
	);
}
