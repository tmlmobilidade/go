'use client';

/* * */

import { MapViewOneStop } from '@/components/Map/MapViewOneStop';
import { StopDetailHeader } from '@/components/stops/detail/StopDetailHeader';
import { StopDetailsSectionAdministrative } from '@/components/stops/detail/StopDetailsSectionAdministrative';
import { StopDetailsSectionBasic } from '@/components/stops/detail/StopDetailsSectionBasic';
import { Pane } from '@tmlmobilidade/ui';

import { Images } from '../Images';
import { Infraestructures } from '../Infrastructures';
import { IntermodalConnections } from '../IntermodalConnections';
import { NotesComments } from '../Notes-Comments';
import { PublicInformation } from '../PublicInformation';
import { ServedEquipment } from '../ServedEquipment';
import { Shelter } from '../Shelter';

/* * */

export function StopDetail() {
	return (
		<Pane header={[<StopDetailHeader />]}>
			<MapViewOneStop />
			<StopDetailsSectionBasic />
			<StopDetailsSectionAdministrative />
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
