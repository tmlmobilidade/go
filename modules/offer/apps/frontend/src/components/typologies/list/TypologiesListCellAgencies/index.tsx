'use client';

import { AgencyTagGroup } from '@tmlmobilidade/ui';

import { useTypologiesAgenciesData } from '../../shared/use-typologies-agencies-data';

/* * */

interface TypologiesListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function TypologiesListCellAgencies({ agencyIds }: TypologiesListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useTypologiesAgenciesData();

	//
	// B. Render components

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);

	//
}
