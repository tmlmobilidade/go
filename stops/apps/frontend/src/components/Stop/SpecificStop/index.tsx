'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
// import { getUnixTimestamp } from '@tmlmobilidade/utils';

import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

import Accessibility from '../Accessibility';
import Affectation from '../Affectation';
import Comments from '../Comments';
import Connections from '../Connections';
import Equipments from '../Equipments';
import Infrasctructure from '../Infrasctructure';
import MapContainer from '../MapContainer';
import Media from '../Media';
import Observations from '../Observations';
import PublicInformation from '../PublicInformation';
import Shelter from '../Shelter';
import StopAdminInformation from '../StopAdminInformation';
import StopDetails from '../StopDetails';
import styles from '../styles.module.css';
/* * */

interface SpecificStopProps {
	stop: Stop
}

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

	const last_shelter_installation_setter = (date: Date) => {
		stop.form.setFieldValue('last_shelter_installation', getUnixTimestampFromJSDate(date));
	};

	const last_infrastructure_check_setter = (date: Date) => {
		stop.form.setFieldValue('last_infrastructure_check', getUnixTimestampFromJSDate(date));
	};

	const last_infrastructure_maintenance_setter = (date: Date) => {
		stop.form.setFieldValue('last_infrastructure_maintenance', getUnixTimestampFromJSDate(date));
	};

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

			<Affectation />

			<Shelter
				last_shelter_installation={stop.form.getInputProps('last_shelter_installation')}
				last_shelter_installation_getter={stop.form.getValues().last_shelter_installation}
				last_shelter_installation_setter={last_shelter_installation_setter}
				shelter_code={stop.form.getInputProps('shelter_code')}
				shelter_maintainer={stop.form.getInputProps('shelter_maintainer')}
				shelter_make={stop.form.getInputProps('shelter_make')}
				shelter_model={stop.form.getInputProps('shelter_model')}
				shelter_status={stop.form.getInputProps('shelter_status')}
			/>

			<Infrasctructure
				last_infrastructure_check={stop.form.getValues().last_infrastructure_check}
				last_infrastructure_check_getter={stop.form.getValues().last_infrastructure_check}
				last_infrastructure_check_setter={last_infrastructure_check_setter}
				last_infrastructure_maintenance={stop.form.getValues().last_infrastructure_maintenance}
				last_infrastructure_maintenance_getter={stop.form.getValues().last_infrastructure_maintenance}
				last_infrastructure_maintenance_setter={last_infrastructure_maintenance_setter}
			/>

			<PublicInformation
				last_schedules_check={stop.form.getValues().last_schedules_check}
				last_schedules_check_getter={stop.form.getValues().last_schedules_check}
				last_schedules_check_setter={last_schedules_check_setter}
				last_schedules_maintenance={stop.form.getValues().last_schedules_maintenance}
				last_schedules_maintenance_getter={stop.form.getValues().last_schedules_maintenance}
				last_schedules_maintenance_setter={last_schedules_maintenance_setter}
			/>

			<Accessibility
				bench_status={stop.form.getInputProps('bench_status')}
				docking_bay_type={stop.form.getInputProps('docking_bay_type')}
				electricity_status={stop.form.getInputProps('electricity_status')}
				flag_status={stop.form.getInputProps('flag_status')}
				lighting_status={stop.form.getInputProps('lighting_status')}
				pavement_type={stop.form.getInputProps('pavement_type')}
				pole_status={stop.form.getInputProps('pole_status')}
				road_type={stop.form.getInputProps('road_type')}
				sidewalk_type={stop.form.getInputProps('sidewalk_type')}
			/>

			<Equipments
				facilities={stop.form.getInputProps('facilities')}
			/>
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
