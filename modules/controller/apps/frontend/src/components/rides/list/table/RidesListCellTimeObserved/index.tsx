'use client';

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { DelayStatusDisplay, displayDuration, displayUnixTimestamp, Section, Tag } from '@tmlmobilidade/ui';
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

	//
	// A. Transform data

	const observedTimeDisplay = useMemo(() => {
		return displayUnixTimestamp(observedTimestamp);
	}, [observedTimestamp]);

	const durationDisplay = useMemo(() => {
		return displayDuration(scheduledTimestamp, observedTimestamp);
	}, [scheduledTimestamp, observedTimestamp]);

	const variantValue = useMemo(() => {
		if (delayStatus === 'early') return 'danger';
		if (delayStatus === 'ontime') return 'success';
		if (delayStatus === 'delayed') return 'warning';
	}, [delayStatus]);

	//
	// B. Render components

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			{observedTimeDisplay && <Tag label={observedTimeDisplay} variant={variantValue} />}
			{delayStatus && <DelayStatusDisplay status={delayStatus} />}
			{durationDisplay && <Tag label={durationDisplay} variant={variantValue} />}
		</Section>
	);
}
