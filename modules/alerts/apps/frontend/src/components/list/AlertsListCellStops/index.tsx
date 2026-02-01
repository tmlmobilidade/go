'use client';

/* * */

import { useStopsContext } from '@/contexts/Stops.context';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';

/* * */

interface AlertsListCellStopsProps {
	values: string[]
}

/* * */

export function AlertsListCellStops({ values }: AlertsListCellStopsProps) {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();

	//
	// B. Transform data

	const preparedTags = values
		.map((item): TagProps => {
			const stopData = stopsContext.actions.getStopById(item);
			if (!stopData) return null;
			return { label: stopData.long_name, variant: 'muted' };
		})
		.filter(Boolean);

	//
	// C. Render components

	return <TagGroup limit={2} tags={preparedTags} />;

	//
}
