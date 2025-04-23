'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
// import { getUnixTimestamp } from '@tmlmobilidade/utils';

import Accessibility from '../Accessibility';
import AdminInformation from '../AdminInformation';
import Affectation from '../Affectation';
import Comments from '../Comments';
import Connections from '../Connections';
import Details from '../Details';
import Equipments from '../Equipments';
import Infrasctructure from '../Infrasctructure';
import MapContainer from '../MapContainer';
import Media from '../Media';
import Observations from '../Observations';
import PublicInformation from '../PublicInformation';
import Shelter from '../Shelter';
import styles from '../styles.module.css';
/* * */

interface SpecificStopProps {
	stop: Stop
}

/* * */

// export default function Stop({ stop }: SpecificStopProps) {
export default function Stop() {
	const stopDetailContext = useStopDetailContext();

	const { data: stop } = stopDetailContext;
	// const all = stopDetailContext;
	console.log('=> stop', stop);
	// console.log('=> latitude', stop.form.getValues().latitude);
	// data.form.getValues();
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<MapContainer generic={false} />
			<Details
				_id={stop.form.getInputProps('_id')}
				latitude={stop.form.getInputProps('latitude')}
				longitude={stop.form.getInputProps('longitude')}
				name={stop.form.getInputProps('name')}
				new_name={stop.form.getInputProps('new_name')}
				operational_status={stop.form.getInputProps('operational_status')}
				short_name={stop.form.getInputProps('short_name')}
				tts_name={stop.form.getInputProps('tts_name')}
			/>
			<AdminInformation
				jurisdication={stop.form.getInputProps('jurisdiction')}
				locality_id={stop.form.getInputProps('locality_id')}
				municipality_id={stop.form.getInputProps('municipality_id')}
				parish_id={stop.form.getInputProps('parish_id')}
			/>
			{/* <Affectation
				affectation={stop.form.getValues().affectation || ['']}
			/> */}

			<Shelter
				// last_shelter_installation={stop.form.getValues().last_shelter_installation || getUnixTimestamp()}
				last_shelter_installation={stop.form.getInputProps('last_shelter_installation')}
				shelter_code={stop.form.getInputProps('shelter_code')}
				shelter_maintainer={stop.form.getInputProps('shelter_maintainer')}
				shelter_make={stop.form.getInputProps('shelter_make')}
				shelter_model={stop.form.getInputProps('shelter_model')}
				shelter_status={stop.form.getInputProps('shelter_status')}
			/>
			{/* <Infrasctructure
				last_infrastructure_check={stop.form.getValues().last_infrastructure_check}
				last_infrastructure_maintenance={stop.form.getValues().last_infrastructure_maintenance}
			/>
			<PublicInformation
				last_schedules_check={stop.form.getValues().last_schedules_check}
				last_schedules_maintenance={stop.form.getValues().last_schedules_maintenance}
			/> */}

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
			{/*
			<Equipments
				facilities={stop.form.getValues().facilities || ['']}
			/>
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
