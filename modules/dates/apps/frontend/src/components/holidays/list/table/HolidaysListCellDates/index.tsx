/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface HolidaysListCellDatesProps {
	value: Holiday['dates']
}

/* * */

export function HolidaysListCellDates({ value }: HolidaysListCellDatesProps) {
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
