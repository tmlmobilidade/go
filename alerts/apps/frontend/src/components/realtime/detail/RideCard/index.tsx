/* * */

import { RidesData } from '@/contexts/Rides.context';
import { Badge, Label, Section, Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayStatus(startTimeScheduled: RidesData['start_time_scheduled'], startTimeObserved: RidesData['start_time_observed']): string {
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

function StartTimeStatusTag({ startTimeObserved, status }: { startTimeObserved: string, status: string }) {
	//

	if (status === 'none') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none">
				<Tag label={startTimeObserved} variant="secondary" />
			</Section>
		);
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none">
				<Tag label={startTimeObserved} variant="secondary" />
				<Tag label="Ontime" variant="success" />
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none">
				<Tag label={startTimeObserved} variant="warning" />
				<Tag label="Delayed" variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="flex-end" padding="none">
				<Tag label={startTimeObserved} variant="danger" />
				<Tag label="Early" variant="danger" />
			</Section>
		);
	}

	//
}

/* * */
export function RideCard({ onSelect, ride, selected }: { onSelect: () => void, ride: RidesData, selected: boolean }) {
	//
	// B. Render components
	return (
		<div className={styles.rideCard} data-selected={selected} onClick={onSelect}>
			<Label size="md">{ride._id}</Label>
			<Section alignItems="center" flexDirection="row" gap="xs" justifyContent="flex-start" padding="none">
				<Badge size="xl" variant="secondary">{ride.line_id.toString()}</Badge>
				<Label size="lg" singleLine>{ride.headsign}</Label>
				<StartTimeStatusTag
					startTimeObserved={Dates.fromUnixTimestamp(ride.start_time_scheduled).toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt')}
					status={getDelayStatus(ride.start_time_scheduled, ride.start_time_observed)}
				/>
			</Section>
		</div>
	);
}
