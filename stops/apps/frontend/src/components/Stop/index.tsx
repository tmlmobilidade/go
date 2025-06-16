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

	const { actions, data, flags } = useStopsDetailContext();

	//
	// B. Render components

	return (
		<ManualContextProvider>
			<StopsListContextProvider>
				{
					flags.loading === false && (data?._id || paramId !== 'new')
						? (
							<div style={{ height: '90vh' }}>
								<Pane header={[<StopHeader generic={false} />]}>
									{/* <StopMap generic={false} /> */}
									<StopsListViewMap />
									<StopDetails />
									<StopAdminInformation />
									{/* <StopAffectation /> */}
									<StopShelter />
									<StopInfrasctructure />
									<StopPublicInformation />
									<StopAccessibility />
									<StopEquipments />
									<StopConnections />
									<StopMedia />
									<StopComments actions={actions} data={data} />
									<StopObservations />
								</Pane>
							</div>
						) : (
							<div style={{ height: '90vh' }}>
								<Pane header={[<StopHeader generic={true} />]}>
									{flags.loading === false && paramId !== 'new' ? <StopsListViewMap generic={true} /> : <div>Loading...</div>}
									{/* {flags.loading === false ? <div>Map...</div> : <div>Loading...</div>} */}
									{/* <StopsListViewMap /> */}
								</Pane>
							</div>
						)
				}
			</StopsListContextProvider>
		</ManualContextProvider>
	);
}
