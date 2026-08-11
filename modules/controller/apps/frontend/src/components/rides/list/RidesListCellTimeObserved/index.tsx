'use client';

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { DelayStatusDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellTimeObservedProps {
	delayStatus?: DelayStatus | null
	observedTimestamp?: null | UnixTimestamp
	scheduledTimestamp?: null | UnixTimestamp
}

/* * */

export function RidesListCellTimeObserved({ delayStatus, observedTimestamp, scheduledTimestamp }: RidesListCellTimeObservedProps) {
	//

	const delayValue = useMemo(() => {
		if (!observedTimestamp || !scheduledTimestamp) return null;
		return observedTimestamp - scheduledTimestamp;
	}, [observedTimestamp, scheduledTimestamp]);

	return (
		<DelayStatusDisplay
			delay={delayValue}
			status={delayStatus}
			timestamp={observedTimestamp}
		/>
	);
}
