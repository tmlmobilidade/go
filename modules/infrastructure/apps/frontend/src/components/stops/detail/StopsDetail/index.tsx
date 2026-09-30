'use client';

import { Divider, Pane } from '@tmlmobilidade/ui';

import { StopsDetailSectionAmenities } from '../amenities/StopsDetailSectionAmenities';
import { StopsDetailSectionChecks } from '../checks/StopsDetailSectionChecks';
import { StopsDetailSectionFlags } from '../flags/StopsDetailSectionFlags';
import { StopsDetailSectionGeneral } from '../general/StopsDetailSectionGeneral';
import { StopsDetailSectionInfrastructure } from '../infrastructure/StopsDetailSectionInfrastructure';
import { StopsDetailSectionShelter } from '../shelter/StopsDetailSectionShelter';
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
			<Divider />
			<StopsDetailSectionGeneral />
			<StopsDetailSectionFlags />
			<StopsDetailSectionInfrastructure />
			<StopsDetailSectionShelter />
			<StopsDetailSectionChecks />
			<StopsDetailSectionAmenities />
		</Pane>
	);
}
