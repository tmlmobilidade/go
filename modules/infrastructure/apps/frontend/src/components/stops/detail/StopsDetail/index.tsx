'use client';

// import { StopDetailsSectionAdministrative } from '@/components/stops/detail/StopDetailsSectionAdministrative';
// import { StopDetailsSectionConnections } from '@/components/stops/detail/StopDetailsSectionConnections';
// import { StopDetailsSectionEquipment } from '@/components/stops/detail/StopDetailsSectionEquipment';
// import { StopDetailsSectionFlags } from '@/components/stops/detail/StopDetailsSectionFlags';
// import { StopDetailsSectionGeneral } from '@/components/stops/detail/StopDetailsSectionGeneral';
// import { StopDetailsSectionImages } from '@/components/stops/detail/StopDetailsSectionImages';
// import { StopDetailsSectionInfrastructure } from '@/components/stops/detail/StopDetailsSectionInfrastructure';
// import { StopDetailsSectionMap } from '@/components/stops/detail/StopDetailsSectionMap';
// import { StopDetailsSectionNotes } from '@/components/stops/detail/StopDetailsSectionNotes';
// import { StopDetailsSectionPublicInformation } from '@/components/stops/detail/StopDetailsSectionPublicInformation';
// import { StopDetailsSectionShelter } from '@/components/stops/detail/StopDetailsSectionShelter';
import { StopsDetailHeader } from '@/components/stops/detail/StopsDetailHeader';
import { Divider, Pane } from '@tmlmobilidade/ui';

import { useStopsDetailData } from '../use-stops-detail-data';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { isLoading } = useStopsDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<StopsDetailHeader key="header" />]} isLoading={isLoading}>
			{/* <StopDetailsSectionMap /> */}
			<Divider />
			{/* <StopDetailsSectionGeneral />
			<StopDetailsSectionFlags />
			<StopDetailsSectionAdministrative />
			<StopDetailsSectionShelter />
			<StopDetailsSectionInfrastructure />
			<StopDetailsSectionPublicInformation />
			<StopDetailsSectionEquipment />
			<StopDetailsSectionConnections />
			<StopDetailsSectionImages />
			<StopDetailsSectionNotes /> */}
		</Pane>
	);
}
