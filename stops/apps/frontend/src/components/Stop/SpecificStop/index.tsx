'use client';

import type { Stop } from '@tmlmobilidade/types';

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import Comments from '../Comments';
import MapContainer from '../MapContainer';
import Media from '../Media';
import Observations from '../Observations';
import StopAccessibility from '../StopAccessibility';
import StopAdminInformation from '../StopAdminInformation';
import StopAffectation from '../StopAffectation';
import StopConnections from '../StopConnections';
import StopDetails from '../StopDetails';
import StopEquipments from '../StopEquipments';
import StopInfrasctructure from '../StopInfrasctructure';
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
			{/*
			<Media
				file_ids={stop.form.getValues().file_ids || ['']}
				image_ids={stop.form.getValues().image_ids || ['']}
			/>

			<Comments
				comments={stop.form.getValues().comments || ['']}
			/>

			<Observations
				observations={stop.form.getValues().observations || ['']}
			/> */}
		</div>
	);
}
