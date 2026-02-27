/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface ZonesListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function ZonesListCellAgencies({ agencyIds }: ZonesListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
