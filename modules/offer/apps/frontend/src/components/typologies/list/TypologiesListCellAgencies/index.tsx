/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface TypologiesListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function TypologiesListCellAgencies({ agencyIds }: TypologiesListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
