'use client';

import type { Stop } from '@tmlmobilidade/types';

import { ManualContextProvider } from '@/contexts/Manual.context';
import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Pane } from '@tmlmobilidade/ui';

import Header from './Header';
import StopAccessibility from './StopAccessibility';
import StopAdminInformation from './StopAdminInformation';
import StopAffectation from './StopAffectation';
import StopComments from './StopComments';
import StopConnections from './StopConnections';
import StopDetails from './StopDetails';
import StopEquipments from './StopEquipments';
import StopInfrasctructure from './StopInfrasctructure';
import StopMap from './StopMap';
import StopMedia from './StopMedia';
import StopObservations from './StopObservations';
import StopPublicInformation from './StopPublicInformation';
import StopShelter from './StopShelter';
import styles from './styles.module.css';

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
			{
				stopDetailContext.data?._id || paramId === 'new'
					? (
						<Pane header={[<Header generic={false} />]}>
							<StopMap generic={false} />
							<StopDetails />
							<StopAdminInformation />
							<StopAffectation />
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
						<Pane header={[<Header generic={false} />]}>
							<StopMap generic={true} />
						</Pane>
					)
			}
		</ManualContextProvider>
	);
}
