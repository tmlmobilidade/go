'use client';

/* * */

import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';
import { useStopsContext } from '@/contexts/Stops.context';

/* * */

import styles from './styles.module.css';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const { actions: _stopsActions, data: stopsData, flags: _stopsFlags } = useStopsContext();
	console.log('-> StopsData:', stopsData);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<Navigation />
			<Stop />
		</div>
	);
}
