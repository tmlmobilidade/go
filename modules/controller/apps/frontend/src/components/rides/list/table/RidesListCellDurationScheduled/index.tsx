'use client';

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayDuration, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellDurationScheduledProps {
	endTimeScheduled?: null | UnixTimestamp
	startTimeScheduled?: null | UnixTimestamp
}

/* * */

export function RidesListCellDurationScheduled({ endTimeScheduled, startTimeScheduled }: RidesListCellDurationScheduledProps) {
	//

	const scheduledDurationDisplay = useMemo(() => {
		return displayDuration(startTimeScheduled, endTimeScheduled, { signed: false });
	}, [startTimeScheduled, endTimeScheduled]);

	if (!scheduledDurationDisplay) return null;

	return <Tag label={scheduledDurationDisplay} variant="muted" />;
}
