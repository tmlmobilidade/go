/* * */

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AnnotationsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function AnnotationsListCellAgencies({ agencyIds }: AnnotationsListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = agencyIds.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;

	//
}
