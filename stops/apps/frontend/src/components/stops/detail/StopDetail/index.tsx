'use client';

/* * */

import { MapViewOneStop } from '@/components/Map/MapViewOneStop';
import { StopDetailHeader } from '@/components/stops/detail/StopDetailHeader';
import { StopDetailsSectionAdministrative } from '@/components/stops/detail/StopDetailsSectionAdministrative';
import { StopDetailsSectionGeneral } from '@/components/stops/detail/StopDetailsSectionGeneral';
import { StopDetailsSectionInfrastructure } from '@/components/stops/detail/StopDetailsSectionInfrastructure';
import { StopDetailsSectionShelter } from '@/components/stops/detail/StopDetailsSectionShelter';
import { Pane } from '@tmlmobilidade/ui';

import { Images } from '../Images';
import { IntermodalConnections } from '../IntermodalConnections';
import { NotesComments } from '../Notes-Comments';
import { PublicInformation } from '../PublicInformation';
import { ServedEquipment } from '../ServedEquipment';

/* * */

export function StopDetail() {
	return (
		<Pane header={[<StopDetailHeader />]}>
			<MapViewOneStop />
			<StopDetailsSectionGeneral />
			<StopDetailsSectionAdministrative />
			<StopDetailsSectionShelter />
			<StopDetailsSectionInfrastructure />
			<PublicInformation />
			<ServedEquipment />
			<IntermodalConnections />
			<Images />
			<NotesComments />
		</Pane>
	);
}
