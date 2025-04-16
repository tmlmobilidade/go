'use client';

/* * */

import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';
import { useStopsContext } from '@/contexts/Stops.context';

/* * */

import { StopDetailContextProvider } from '@/contexts/StopDetail.context';
import { StopListContextProvider } from '@/contexts/StopList.context';

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
			<StopListContextProvider>
				<Navigation />
			</StopListContextProvider>
			<StopDetailContextProvider stopId="010001">
				<Stop />
			</StopDetailContextProvider>
		</div>
	);
}
