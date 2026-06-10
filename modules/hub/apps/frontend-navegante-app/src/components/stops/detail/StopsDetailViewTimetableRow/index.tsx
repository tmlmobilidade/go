'use client';

import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { NextArrivals } from '@/components/stops/detail/NextArrivals';
import { type StopsDetailViewTimetableData } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewTimetableClock } from '@/components/stops/detail/StopsDetailViewTimetableClock';

import styles from './styles.module.css';

/* * */

interface StopsDetailViewTimetableRowProps {
	data: StopsDetailViewTimetableData
	withClock: boolean
}

/* * */

export function StopsDetailViewTimetableRow({ data, withClock }: StopsDetailViewTimetableRowProps) {
	return (
		<>

			<div className={styles.container} data-with-clock={withClock}>
				<div className={styles.summary}>
					<LineDisplay
						color={data.color}
						longName={data.headsign}
						shortName={data.short_name}
						textColor={data.text_color}
					/>
					{data.arrival_scheduled_ms}
					<NextArrivals
						arrivals={[data.arrival_scheduled_ms]}
						scheduledArrivals={data.arrival_observed_ms ? [data.arrival_observed_ms] : undefined}
						status={data.arrival_observed_ms ? 'realtime' : 'scheduled'}
						tripId={data.trip_ids[0]}
					/>
				</div>
			</div>

			{withClock && (
				<div className={styles.clockWrapper}>
					<StopsDetailViewTimetableClock />
				</div>
			)}

		</>
	);
}
