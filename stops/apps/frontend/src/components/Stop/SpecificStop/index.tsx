'use client';

/* * */

import type { Stop } from '@tmlmobilidade/types';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

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
	console.log('??? stopDetailContext', stopDetailContext);

	const { data: stop } = stopDetailContext;
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<MapContainer generic={false} />
			<Details
				_id={stop?._id || ''}
				latitude={stop?.latitude || 0}
				longitude={stop?.longitude || 0}
				name={stop?.name || ''}
				new_name={stop?.new_name || ''}
				operational_status={stop?.operational_status || 'voided'} // TODO: Check corresponding strings, example: active -> "Paragem Activa"
				short_name={stop?.short_name || ''}
				tts_name={stop?.tts_name || ''}
			/>
			<AdminInformation
				jurisdication={stop?.jurisdiction || ''} // TODO: Check where to get this data
				locality_id={stop?.locality_id || ''} // TODO: Use name instead of id
				municipality_id={stop?.municipality_id || ''} // TODO: Use name instead of id
				parish_id={stop?.parish_id || ''} // TODO: Check where to get this data
			/>
			<Affectation
				// TODO: Check where to get this data
			/>
			<Shelter />
			<Infrasctructure />
			<PublicInformation />
			<Accessibility />
			<Equipments />
			<Connections />
			<Media />
			<Comments />
		</div>
	);
}
