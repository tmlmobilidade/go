/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AnnotationsListCellDatesProps {
	value: Annotation['dates']
}

/* * */

export function AnnotationsListCellDates({ value }: AnnotationsListCellDatesProps) {
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
