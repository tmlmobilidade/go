'use client';

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayUnixTimestamp, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellTimeScheduledProps {
	timestamp: UnixTimestamp
}

/* * */

export function RidesListCellTimeScheduled({ timestamp }: RidesListCellTimeScheduledProps) {
	//

	const scheduledTimeDisplay = useMemo(() => {
		return displayUnixTimestamp(timestamp);
	}, [timestamp]);

	if (!scheduledTimeDisplay) return null;

	return <Tag label={scheduledTimeDisplay} variant="muted" />;
}
