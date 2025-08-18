'use client';

/* * */

import { MapViewOneStop } from '@/components/map/overlays/MapViewOneStop';
import { StopDetailHeader } from '@/components/stops/detail/StopDetailHeader';
import { StopDetailsSectionAdministrative } from '@/components/stops/detail/StopDetailsSectionAdministrative';
import { StopDetailsSectionConnections } from '@/components/stops/detail/StopDetailsSectionConnections';
import { StopDetailsSectionEquipment } from '@/components/stops/detail/StopDetailsSectionEquipment';
import { StopDetailsSectionGeneral } from '@/components/stops/detail/StopDetailsSectionGeneral';
import { StopDetailsSectionImages } from '@/components/stops/detail/StopDetailsSectionImages';
import { StopDetailsSectionInfrastructure } from '@/components/stops/detail/StopDetailsSectionInfrastructure';
import { StopDetailsSectionNotes } from '@/components/stops/detail/StopDetailsSectionNotes';
import { StopDetailsSectionPublicInformation } from '@/components/stops/detail/StopDetailsSectionPublicInformation';
import { StopDetailsSectionShelter } from '@/components/stops/detail/StopDetailsSectionShelter';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function StopDetail() {
	return (
		<Pane header={[<StopDetailHeader />]}>
			<MapViewOneStop />
			<StopDetailsSectionGeneral />
			<StopDetailsSectionAdministrative />
			<StopDetailsSectionShelter />
			<StopDetailsSectionInfrastructure />
			<StopDetailsSectionPublicInformation />
			<StopDetailsSectionEquipment />
			<StopDetailsSectionConnections />
			<StopDetailsSectionImages />
			<StopDetailsSectionNotes />
		</Pane>
	);
}
