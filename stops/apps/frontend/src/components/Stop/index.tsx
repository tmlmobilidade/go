'use client';

import type { Stop } from '@tmlmobilidade/types';

import { ManualContextProvider } from '@/contexts/Manual.context';
import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Pane } from '@tmlmobilidade/ui';

import StopAccessibility from './StopAccessibility';
import StopAdminInformation from './StopAdminInformation';
// import StopAffectation from './StopAffectation';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import StopComments from './StopComments';
import StopConnections from './StopConnections';
import StopDetails from './StopDetails';
import StopEquipments from './StopEquipments';
import StopHeader from './StopHeader';
import StopInfrasctructure from './StopInfrasctructure';
import { StopsListViewMap } from './StopMap/index';
import StopMedia from './StopMedia';
import StopObservations from './StopObservations';
import StopPublicInformation from './StopPublicInformation';
import StopShelter from './StopShelter';

/* * */

interface StopProps {
	paramId: string
}

/* * */

export default function Stop({ paramId }: StopProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<ManualContextProvider>
			<StopsListContextProvider>
				{
					stopDetailContext.data?._id || paramId === 'new'
						? (
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
								<StopComments />
								<StopObservations />
							</Pane>
						// </div>
						) : (
							<Pane header={[<StopHeader generic={true} />]}>
								<StopsListViewMap />
								{/* <StopMap generic={true} /> */}
							</Pane>
						)
				}
			</StopsListContextProvider>
		</ManualContextProvider>
	);
}
