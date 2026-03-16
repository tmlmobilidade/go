/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface HolidaysListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function HolidaysListCellAgencies({ agencyIds }: HolidaysListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
