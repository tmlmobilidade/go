/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface EventsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function EventsListCellAgencies({ agencyIds }: EventsListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
