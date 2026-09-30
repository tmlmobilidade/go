'use client';

import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { Divider, Pane } from '@tmlmobilidade/ui';

import { StopsDetailSectionFlags } from '../flags/StopsDetailSectionFlags';
import { StopsDetailHeader } from '../StopsDetailHeader';
import { StopsDetailSectionAmenities } from '../StopsDetailSectionAmenities';
import { StopsDetailSectionChecks } from '../StopsDetailSectionChecks';
import { StopsDetailSectionGeneral } from '../StopsDetailSectionGeneral';
import { StopsDetailSectionInfrastructure } from '../StopsDetailSectionInfrastructure';
import { StopsDetailSectionShelter } from '../StopsDetailSectionShelter';

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
