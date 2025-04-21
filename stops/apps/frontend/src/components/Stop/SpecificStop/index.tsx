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

	// console.log('??? stopDetailContext', stopDetailContext);
	const { data: stop } = stopDetailContext;
	console.log('??? stop?.form.getValues().latitude', stop.form.getValues().latitude);
	// data.form.getValues();
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<MapContainer generic={false} />
			<Details
				_id={stop?._id || ''}
				latitude={stop.form.getValues().latitude || 0}
				longitude={stop.form.getValues().longitude || 0}
				name={stop.form.getValues().name || ''}
				new_name={stop.form.getValues().new_name || ''}
				operational_status={stop.form.getValues().operational_status || 'voided'} // TODO: Check corresponding strings, example: active -> "Paragem Activa"
				short_name={stop.form.getValues().short_name || ''}
				tts_name={stop.form.getValues().tts_name || ''}
			/>
			<AdminInformation
				jurisdication={stop.form.getValues().jurisdiction || ''} // TODO: Check where to get this data
				locality_id={stop.form.getValues().locality_id || ''} // TODO: Use name instead of id
				municipality_id={stop.form.getValues().municipality_id || ''} // TODO: Use name instead of id
				parish_id={stop.form.getValues().parish_id || ''} // TODO: Check where to get this data
			/>
			<Affectation
				affectation={stop.form.getValues().affectation || ['']} // TODO: Check where to get this data
			/>
			<Shelter
				// last_shelter_installation={stop.form.getValues().last_shelter_installation || getUnixTimestamp()}
				last_shelter_installation={stop.form.getValues().last_shelter_installation}
				shelter_code={stop.form.getValues().shelter_code || ''}
				shelter_maintainer={stop.form.getValues().shelter_maintainer || ''}
				shelter_make={stop.form.getValues().shelter_make || ''}
				shelter_model={stop.form.getValues().shelter_model || ''}
				shelter_status={stop.form.getValues().shelter_status || 'unknown'}
			/>
			<Infrasctructure
				last_infrastructure_check={stop.form.getValues().last_infrastructure_check}
				last_infrastructure_maintenance={stop.form.getValues().last_infrastructure_maintenance}
			/>
			<PublicInformation
				last_schedules_check={stop.form.getValues().last_schedules_check}
				last_schedules_maintenance={stop.form.getValues().last_schedules_maintenance}
			/>
			<Accessibility
				bench_status={stop.form.getValues().bench_status || 'unknown'}
				docking_bay_type={stop.form.getValues().docking_bay_type || 'unknown'}
				electricity_status={stop.form.getValues().electricity_status || 'unknown'}
				flag_status={stop.form.getValues().flag_status || 'unknown'}
				lighting_status={stop.form.getValues().lighting_status || 'unknown'}
				pavement_type={stop.form.getValues().pavement_type || 'unknown'}
				pole_status={stop.form.getValues().pole_status || 'unknown'}
				road_type={stop.form.getValues().road_type || 'unknown'}
				sidewalk_type={stop.form.getValues().sidewalk_type || 'unknown'}
			/>
			<Equipments
				facilities={stop.form.getValues().facilities || ['']} // TODO: Check where to get this data
			/>
			<Connections
				connections={stop.form.getValues().connections || ['']} // TODO: Check where to get this data
			/>
			<Media />
			<Comments />
		</div>
	);
}
