/* * */

import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface YearPeriodsListCellAgenciesProps {
	value: YearPeriod['agency_ids']
}

/* * */

export function YearPeriodsListCellAgencies({ value }: YearPeriodsListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = value.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;
}
