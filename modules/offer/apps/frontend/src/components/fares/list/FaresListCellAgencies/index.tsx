/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface FaresListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function FaresListCellAgencies({ agencyIds }: FaresListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
