'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';

/* * */

interface PeriodsListCellAgencyProps {
	agencyIds: string[]
}

/* * */

export function PeriodsListCellAgency({ agencyIds }: PeriodsListCellAgencyProps) {
	//

	//
	// A. Fetch data

	const { data } = usePeriodsAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);

	//
}
