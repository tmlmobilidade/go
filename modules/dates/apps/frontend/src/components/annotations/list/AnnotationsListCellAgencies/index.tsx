'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';

/* * */

interface AnnotationsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function AnnotationsListCellAgencies({ agencyIds }: AnnotationsListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useAnnotationsAgenciesData();

	//
	// B. Render components

	if (!agencyIds.length) return null;

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);
}
