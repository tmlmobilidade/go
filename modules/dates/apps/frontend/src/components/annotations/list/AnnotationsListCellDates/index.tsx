/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AnnotationsListCellDatesProps {
	dates: OperationalDateInt[]
}

/* * */

export function AnnotationsListCellDates({ dates }: AnnotationsListCellDatesProps) {
	//

	//
	// A. Transform data

	const preparedTags = [...dates]
		.sort((a, b) => Number(a) - Number(b))
		.map((item): TagProps => {
			return {
				label: Dates
					.fromOperationalDateInt(item, 'Europe/Lisbon')
					.toFormat('dd-MM-yyyy'),
				variant: 'muted',
			};
		});

	//
	// B. Render components

	return (

		<TagGroup limit={4} tags={preparedTags} />

	);

	//
}
