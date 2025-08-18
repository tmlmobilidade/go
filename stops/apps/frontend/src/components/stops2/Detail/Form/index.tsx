'use client';

/* * */

import { MapViewOneStop } from '@/components/Map/MapViewOneStop';
import { Pane } from '@tmlmobilidade/ui';

import { AdministratorInfo } from './AdministratorInfo';
import { Images } from './Images';
import { Infraestructures } from './Infrastructures';
import { IntermodalConnections } from './IntermodalConnections';
import { NotesComments } from './Notes-Comments';
import { PublicInformation } from './PublicInformation';
import { ServedEquipment } from './ServedEquipment';
import { Shelter } from './Shelter';
import { StopDetailsBasic } from './StopDetailsBasic';
import { StopHeader } from './StopHeader';

/* * */

export function FormInfos() {
	return (
		<Pane header={[<StopHeader />]}>
			<MapViewOneStop />
			<StopDetailsBasic />
			<AdministratorInfo />
			<Shelter />
			<Infraestructures />
			<PublicInformation />
			<ServedEquipment />
			<IntermodalConnections />
			<Images />
			<NotesComments />
		</Pane>
	);
}
