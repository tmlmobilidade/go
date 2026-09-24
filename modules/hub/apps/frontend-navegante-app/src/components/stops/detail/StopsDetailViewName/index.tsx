'use client';

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewName() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	return (
		<h1 className={styles.name}>{stopsDetailContext.data.stop.name}</h1>
	);
}
