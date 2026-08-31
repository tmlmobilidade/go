'use client';

import { Divider, Pane } from '@tmlmobilidade/ui';

import { StopsDetailSectionGeneral } from '../general/StopsDetailSectionGeneral';
import { StopsDetailHeader } from '../StopsDetailHeader';
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
			<StopsDetailSectionGeneral />
			{/* <StopDetailsSectionFlags /> */}
			{/* <StopDetailsSectionAdministrative /> */}
			{/* <StopDetailsSectionShelter /> */}
			{/* <StopDetailsSectionInfrastructure /> */}
			{/* <StopDetailsSectionPublicInformation /> */}
			{/* <StopDetailsSectionEquipment /> */}
			{/* <StopDetailsSectionConnections /> */}
			{/* <StopDetailsSectionImages /> */}
			{/* <StopDetailsSectionNotes /> */}
		</Pane>
	);
}
