'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { ManualContextProvider } from '@/contexts/Manual.context';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import GenericContainer from './GenericContainer';
import SpecificContainer from './SpecificStop';

/* * */

interface StopProps {
	paramId: string
}

export default function Stop({ paramId }: StopProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { data } = stopDetailContext;
	// console.log('=> data', data);
	console.log('=> new_name', data.form.getValues().new_name);

	//
	// B. Render components

	return (
		<ManualContextProvider>
			{
				data?._id || paramId === 'new' ? <SpecificContainer /> : <GenericContainer />
			}
		</ManualContextProvider>
	);
}
