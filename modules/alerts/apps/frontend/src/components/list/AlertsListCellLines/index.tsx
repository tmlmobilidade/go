'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AlertsListCellLinesProps {
	values: string[]
}

/* * */

export function AlertsListCellLines({ values }: AlertsListCellLinesProps) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();

	//
	// B. Transform data

	const preparedTags = values
		.map((item): TagProps => {
			const lineData = linesContext.actions.getLineDataById(item);
			if (!lineData) return null;
			return { label: lineData.code, variant: 'muted' };
		})
		.filter(Boolean);

	//
	// C. Render components

	return <TagGroup limit={2} tags={preparedTags} />;

	//
}
