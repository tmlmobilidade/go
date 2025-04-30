'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { ManualContextProvider } from '@/contexts/Manual.context';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import GenericContainer from './GenericContainer';
import MapContainer from './MapContainer';
import SpecificContainer from './SpecificContainer';
import StopAccessibility from './StopAccessibility';
import StopAdminInformation from './StopAdminInformation';
import StopAffectation from './StopAffectation';
import StopConnections from './StopConnections';
import StopDetails from './StopDetails';
import StopEquipments from './StopEquipments';
import StopInfrasctructure from './StopInfrasctructure';
import StopMedia from './StopMedia';
import StopObservations from './StopObservations';
import StopPublicInformation from './StopPublicInformation';
import StopShelter from './StopShelter';
import styles from './styles.module.css';

/* * */

interface StopProps {
	paramId: string
}

export default function StopContainer({ paramId }: StopProps) {
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
				data?._id || paramId === 'new'
					? (
						<div className={styles.container}>
							<MapContainer generic={false} />
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
							{/*
								<Comments
									comments={stop.form.getValues().comments || ['']}
								/>
								*/}
							<StopObservations />
						</div>
					) : (
						<div className={styles.container}>
							<MapContainer generic={true} />
						</div>
					)
			}
		</ManualContextProvider>
	);
}
