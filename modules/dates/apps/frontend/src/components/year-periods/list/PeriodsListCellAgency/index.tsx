/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface PeriodsListCellAgencyProps {
	agencyIds: string[]
}

/* * */

export function PeriodsListCellAgency({ agencyIds }: PeriodsListCellAgencyProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
