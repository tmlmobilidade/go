'use client';

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AlertsListCellStopsProps {
	values: string[]
}

/* * */

export function AlertsListCellStops({ values }: AlertsListCellStopsProps) {
	//

	//
	// A. Transform data

	const preparedTags = values.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={2} tags={preparedTags} />;

	//
}
