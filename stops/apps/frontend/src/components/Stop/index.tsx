'use client';

/* * */

import type { Stop } from '@carrismetropolitana/api-types/network';

/* * */

import { ManualContextProvider } from '@/contexts/Manual.context';
import { useStopsContext } from '@/contexts/Stops.context';

/* * */

import GenericStop from './GenericStop';
import SpecificStop from './SpecificStop';

/* * */

export default function Stop() {
	//

	//
	// A. Setup variables

	const { actions } = useStopsContext();

	// const stopId: string = null;
	const stopId = '010001';
	const stop: Stop = actions.getStopById(stopId);

	console.log('--> stop', stop);

	//

	//
	// B. Render components

	return (
		<ManualContextProvider>
			{
				stopId ? <SpecificStop stop={stop} /> : <GenericStop />
			}
		</ManualContextProvider>
	);
}
