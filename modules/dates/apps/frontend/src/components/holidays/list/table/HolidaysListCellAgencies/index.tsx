/* * */

import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface HolidaysListCellAgenciesProps {
	value: Holiday['agency_ids']
}

/* * */

export function HolidaysListCellAgencies({ value }: HolidaysListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = value.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;
}
