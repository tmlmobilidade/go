/* * */

import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AnnotationsListCellAgenciesProps {
	value: Annotation['agency_ids']
}

/* * */

export function AnnotationsListCellAgencies({ value }: AnnotationsListCellAgenciesProps) {
	//

	//
	// A. Transform data

	const preparedTags = value.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={4} tags={preparedTags} />;
}
