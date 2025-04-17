'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { ManualContextProvider } from '@/contexts/Manual.context';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import GenericStop from './GenericStop';
import SpecificStop from './SpecificStop';

/* * */

export default function Stop() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { data } = stopDetailContext;
	console.log('=> data', data);
	console.log('=> data.flag_status', data.form.getValues().flag_status);

	//
	// B. Render components

	return (
		<ManualContextProvider>
			{
				data?._id ? <SpecificStop /> : <GenericStop />
			}
		</ManualContextProvider>
	);
}
