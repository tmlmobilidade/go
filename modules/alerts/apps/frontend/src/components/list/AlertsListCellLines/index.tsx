'use client';

import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AlertsListCellLinesProps {
	values: string[]
}

/* * */

export function AlertsListCellLines({ values }: AlertsListCellLinesProps) {
	//

	//
	// A. Transform data

	const preparedTags = values.map((item): TagProps => ({ label: item, variant: 'muted' }));

	//
	// B. Render components

	return <TagGroup limit={2} tags={preparedTags} />;

	//
}
