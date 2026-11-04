'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useFaresAgenciesData } from '../../shared/use-fares-agencies-data';

/* * */

interface FaresListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function FaresListCellAgencies({ agencyIds }: FaresListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useFaresAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);

	//
}
