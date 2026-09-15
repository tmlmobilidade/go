/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface EventsListCellDatesProps {
	value: Event['dates']
}

/* * */

export function EventsListCellDates({ value }: EventsListCellDatesProps) {
	//

	//
	// A. Transform data

	const preparedTags = [...value]
		.sort((a, b) => Number(a) - Number(b))
		.map((item): TagProps => ({
			label: Dates.fromOperationalDate(item, 'Europe/Lisbon').toFormat('dd-MM-yyyy'),
			variant: 'muted',
		}));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;
}
