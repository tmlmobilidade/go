'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useEventsAgenciesData } from '../../shared/use-events-agencies-data';

/* * */

interface EventsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function EventsListCellAgencies({ agencyIds }: EventsListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useEventsAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);

	//
}
