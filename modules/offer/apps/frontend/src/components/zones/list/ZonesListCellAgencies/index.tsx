'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useZonesAgenciesData } from '../../shared/use-zones-agencies-data';

/* * */

interface ZonesListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function ZonesListCellAgencies({ agencyIds }: ZonesListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useZonesAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);

	//
}
