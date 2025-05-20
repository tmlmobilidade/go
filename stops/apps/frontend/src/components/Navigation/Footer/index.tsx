'use client';

import { useStopsListContext } from '@/contexts/StopsList.context';

import styles from './styles.module.css';

/* * */

export function Footer() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			Encontradas {stopsListContext.data.raw.length} paragens
		</div>
	);
}
