'use client';

/* * */

import { type RideNormalized } from '@tmlmobilidade/types';
import { Section, Tag } from '@tmlmobilidade/ui';

/* * */

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayStatus(startTimeScheduled: RideNormalized['start_time_scheduled'], startTimeObserved: RideNormalized['start_time_observed']): string {
	//

	if (!startTimeScheduled || !startTimeObserved) {
		return 'none';
	}

	const difference = startTimeObserved - startTimeScheduled;

	// 5 minutes late
	if (difference > 300000) {
		return 'delayed';
	}

	// 1 minute early
	if (difference < -60000) {
		return 'early';
	}

	return 'ontime';

	//
}

export function StartTimeStatusTag({ startTimeObserved, status }: { startTimeObserved: string, status: string }) {
	//

	if (status === 'none') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none" width="fit-content">
				<Tag label={startTimeObserved} variant="secondary" />
			</Section>
		);
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none" width="fit-content">
				<Tag label={startTimeObserved} variant="secondary" />
				<Tag label="Ontime" variant="success" />
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none" width="fit-content">
				<Tag label={startTimeObserved} variant="warning" />
				<Tag label="Delayed" variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none" width="fit-content">
				<Tag label={startTimeObserved} variant="danger" />
				<Tag label="Early" variant="danger" />
			</Section>
		);
	}

	//
}
