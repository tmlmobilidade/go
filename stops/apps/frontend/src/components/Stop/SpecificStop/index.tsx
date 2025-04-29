'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
// import { getUnixTimestamp } from '@tmlmobilidade/utils';

import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

import Comments from '../Comments';
import Connections from '../Connections';
import MapContainer from '../MapContainer';
import Media from '../Media';
import Observations from '../Observations';
import StopAccessibility from '../StopAccessibility';
import StopAdminInformation from '../StopAdminInformation';
import StopAffectation from '../StopAffectation';
import StopDetails from '../StopDetails';
import StopEquipments from '../StopEquipments';
import StopInfrasctructure from '../StopInfrasctructure';
import StopPublicInformation from '../StopPublicInformation';
import StopShelter from '../StopShelter';
import styles from '../styles.module.css';

/* * */

// export default function Stop({ stop }: SpecificStopProps) {
export default function Stop() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const { data: stop } = stopDetailContext;
	console.log('=> stop', stop);

	//
	// B. Transform data

	const last_schedules_check_setter = (date: Date) => {
		stop.form.setFieldValue('last_schedules_check', getUnixTimestampFromJSDate(date));
	};

	const last_schedules_maintenance_setter = (date: Date) => {
		stop.form.setFieldValue('last_schedules_maintenance', getUnixTimestampFromJSDate(date));
	};

	//
	// C. Render components

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

			{/*
			<Connections
				connections={stop.form.getValues().connections || ['']}
			/>

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
