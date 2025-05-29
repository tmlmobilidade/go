'use client';

import type { Stop } from '@tmlmobilidade/types';

import { useLinesContext } from '@/contexts/Lines.context';
import { ManualContextProvider } from '@/contexts/Manual.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { Pane } from '@tmlmobilidade/ui';

import { StopAccessibility } from './StopAccessibility';
import { StopAdminInformation } from './StopAdminInformation';
import { StopComments } from './StopComments';
import { StopConnections } from './StopConnections';
import { StopDetails } from './StopDetails';
import { StopEquipments } from './StopEquipments';
import { StopHeader } from './StopHeader';
import { StopInfrasctructure } from './StopInfrasctructure';
import { StopsListViewMap } from './StopMap/index';
import { StopMedia } from './StopMedia';
import { StopObservations } from './StopObservations';
import { StopPublicInformation } from './StopPublicInformation';
import { StopShelter } from './StopShelter';

/* * */

interface StopProps {
	paramId: string
}

/* * */

export default function Stop({ paramId }: StopProps) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const { actions: { getStopById } } = useStopsContext();
	const { actions, data, flags } = useStopsDetailContext();
	console.log('linesContext', linesContext);
	console.log('data', data.form.getValues().is_archived);
	//
	// B. Render components

	return (
		<ManualContextProvider>
			<StopsListContextProvider>
				{
					flags.loading === false && (data?._id || paramId === 'new')
						? (
							<Pane header={[<StopHeader generic={false} />]}>
								{/* <StopMap generic={false} /> */}
								<StopsListViewMap getStopById={getStopById} />
								<StopDetails />
								<StopAdminInformation />
								{/* <StopAffectation /> */}
								<StopShelter />
								<StopInfrasctructure />
								<StopPublicInformation />
								<StopAccessibility />
								<StopEquipments />
								<StopConnections />
								<StopMedia actions={actions} data={data} />
								<StopComments actions={actions} data={data} />
								<StopObservations data={data} />
							</Pane>
						// </div>
						) : (
							<Pane header={[<StopHeader generic={true} />]}>
								{flags.loading === false ? <StopsListViewMap generic={true} getStopById={getStopById} /> : <div>Loading...</div>}
								{/* <StopsListViewMap /> */}
							</Pane>
						)
				}
			</StopsListContextProvider>
		</ManualContextProvider>
	);
}
