'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useHolidaysAgenciesData } from '../../shared/use-holidays-agencies-data';

/* * */

interface HolidaysListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function HolidaysListCellAgencies({ agencyIds }: HolidaysListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useHolidaysAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);
}
