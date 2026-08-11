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

	const labelValue = useMemo(() => {
		return displayUnixTimestamp(timestamp) ?? '-';
	}, [timestamp]);

	return <Tag label={labelValue} variant="muted" />;
}
