'use client';

/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { AgencyTag } from '@tmlmobilidade/ui';

/* * */

interface LinesListCellAgencyProps {
	agencyId: string
}

/* * */

export function LinesListCellAgency({ agencyId }: LinesListCellAgencyProps) {
	//
	// A. Setup variables

	const { data } = useLinesListContext();

	//
	// B. Render components

	return (
		<AgencyTag
			agencyId={agencyId}
			copyOnClick={false}
			data={data.agencies}
			showShortName
		/>
	);
}
