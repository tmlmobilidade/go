'use client';

/* * */

import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';
import { useStopsContext } from '@/contexts/Stops.context';
// import router, { useRouter } from 'next/router';
import { useRouter } from 'next/compat/router';

/* * */

import { StopDetailContextProvider } from '@/contexts/StopDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export default function Page() {
	// const router = useRouter();
	// const [stopId, setStopId] = useState<null | string>(null);
	//

	//
	// A. Setup variables

	// const { actions: _stopsActions, data: stopsData, flags: _stopsFlags } = useStopsContext();
	// console.log('-> StopsData:', stopsData);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<StopsListContextProvider>
				<Navigation />
			</StopsListContextProvider>
			<StopDetailContextProvider stopId={null}>
				<Stop paramId={null} />
			</StopDetailContextProvider>
		</div>
	);
}
