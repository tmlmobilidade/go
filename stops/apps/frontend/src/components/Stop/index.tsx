'use client';

import type { Stop } from '@tmlmobilidade/types';

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

	const { actions: { getStopById } } = useStopsContext();
	const { actions, data, flags } = useStopsDetailContext();

	//
	// B. Render components

	return (
		<ManualContextProvider>
			<StopsListContextProvider>
				{
					flags.loading === false && (data?._id || paramId === 'new')
						? (
							<Pane header={[<StopHeader actions={actions} data={data} generic={false} />]}>
								{/* <StopMap generic={false} /> */}
								<StopsListViewMap data={data}getStopById={getStopById} />
								<StopDetails data={data} />
								<StopAdminInformation data={data} />
								{/* <StopAffectation /> */}
								<StopShelter data={data} />
								<StopInfrasctructure data={data} />
								<StopPublicInformation data={data} />
								<StopAccessibility data={data} />
								<StopEquipments data={data} />
								<StopConnections actions={actions} data={data} />
								<StopMedia actions={actions} data={data} />
								<StopComments actions={actions} data={data} />
								<StopObservations data={data} />
							</Pane>
						// </div>
						) : (
							<Pane header={[<StopHeader actions={actions} data={data} generic={true} />]}>
								{flags.loading === false ? <StopsListViewMap data={data} generic={true} getStopById={getStopById} /> : <div>Loading...</div>}
								{/* <StopsListViewMap /> */}
							</Pane>
						)
				}
			</StopsListContextProvider>
		</ManualContextProvider>
	);
}
