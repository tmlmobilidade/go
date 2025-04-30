'use client';

import type { Stop } from '@tmlmobilidade/types';

import Comments from '../Comments';
import MapContainer from '../MapContainer';
import StopAccessibility from '../StopAccessibility';
import StopAdminInformation from '../StopAdminInformation';
import StopAffectation from '../StopAffectation';
import StopConnections from '../StopConnections';
import StopDetails from '../StopDetails';
import StopEquipments from '../StopEquipments';
import StopInfrasctructure from '../StopInfrasctructure';
import StopMedia from '../StopMedia';
import StopObservations from '../StopObservations';
import StopPublicInformation from '../StopPublicInformation';
import StopShelter from '../StopShelter';
import styles from '../styles.module.css';

/* * */

export default function Stop() {
	//

	//
	// A. Render components

	return (
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
	);
}
