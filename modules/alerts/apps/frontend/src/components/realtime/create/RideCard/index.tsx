/* * */

import { getDelayStatus, StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { RidesData } from '@/contexts/Rides.context';
import { Dates } from '@go/dates';
import { Badge, Label, Section } from '@go/ui';

import styles from './styles.module.css';

/* * */

export function RideCard({ onSelect, ride, selected }: { onSelect: () => void, ride: RidesData, selected: boolean }) {
	//
	// B. Render components
	return (
		<div className={styles.rideCard} data-selected={selected} onClick={onSelect}>
			<Label size="md">{ride._id}</Label>
			<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="xs" justifyContent="space-between" padding="none">
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none" width="fit-content">
					<Badge size="xl" variant="secondary">{ride.line_id.toString()}</Badge>
					<Label size="lg" singleLine>{ride.headsign}</Label>
				</Section>
				<StartTimeStatusTag
					startTimeObserved={Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt')}
					status={getDelayStatus(ride.start_time_scheduled, ride.start_time_observed)}
				/>
			</Section>
		</div>
	);
}
