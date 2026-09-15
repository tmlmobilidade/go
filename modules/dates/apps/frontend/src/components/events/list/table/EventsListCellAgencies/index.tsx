/* * */

import { type Event } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface EventsListCellAgenciesProps {
	value: Event['agency_ids']
}

/* * */

export function EventsListCellAgencies({ value }: EventsListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = value.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;
}
