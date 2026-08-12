'use client';

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayDuration, Section, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellDurationObservedProps {
	endTimeObserved?: null | UnixTimestamp
	endTimeScheduled?: null | UnixTimestamp
	startTimeObserved?: null | UnixTimestamp
	startTimeScheduled?: null | UnixTimestamp
}

/* * */

export function RidesListCellDurationObserved({ endTimeObserved, endTimeScheduled, startTimeObserved, startTimeScheduled }: RidesListCellDurationObservedProps) {
	//

	//
	// A. Transform data

	const variantValue = useMemo(() => {
		// 5 minutes margin for duration difference
		const margin = 300_000;
		// Calculate the duration difference
		const scheduledDuration = endTimeScheduled - startTimeScheduled;
		const observedDuration = endTimeObserved - startTimeObserved;
		const difference = observedDuration - scheduledDuration;
		// If the difference is greater than the margin, return warning
		if (difference > margin || difference < -margin) return 'warning';
		// Otherwise return success
		return 'success';
	}, [endTimeObserved, startTimeObserved, endTimeScheduled, startTimeScheduled]);

	const observedDurationDisplay = useMemo(() => {
		return displayDuration(startTimeObserved, endTimeObserved, { signed: false });
	}, [startTimeObserved, endTimeObserved]);

	const differenceDisplay = useMemo(() => {
		// Skip if values are not available
		if (!endTimeObserved || !startTimeObserved || !endTimeScheduled || !startTimeScheduled) return;
		// Calculate the duration difference
		const scheduledDuration = endTimeScheduled - startTimeScheduled;
		const observedDuration = endTimeObserved - startTimeObserved;
		const differenceInMinutes = Math.round((observedDuration - scheduledDuration) / 60_000);
		// Return the difference in minutes
		if (differenceInMinutes > 0) return `+${differenceInMinutes}min`;
		if (differenceInMinutes < 0) return `${differenceInMinutes}min`;
	}, [endTimeObserved, startTimeObserved, endTimeScheduled, startTimeScheduled]);

	//
	// B. Render components

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			{observedDurationDisplay && <Tag label={observedDurationDisplay} variant={variantValue} />}
			{differenceDisplay && <Tag label={differenceDisplay} variant={variantValue} />}
		</Section>
	);
}
