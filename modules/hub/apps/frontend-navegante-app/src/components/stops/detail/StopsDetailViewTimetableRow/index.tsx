'use client';

import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { type StopsDetailViewTimetableData } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewTimetableClock } from '@/components/stops/detail/StopsDetailViewTimetableClock';
import { StopsDetailViewTimetableRowArrival } from '@/components/stops/detail/StopsDetailViewTimetableRowArrival';

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

			{withClock && (
				<div className={styles.clockWrapper}>
					<StopsDetailViewTimetableClock />
				</div>
			)}

			<div
				className={styles.container}
				data-is-past={data.is_past}
				data-with-clock={withClock}
			>
				<div className={styles.summary}>
					<LineDisplay
						agencyId={data.agency_id}
						color={data.color}
						longName={data.headsign}
						shortName={data.short_name}
						textColor={data.text_color}
					/>
					<StopsDetailViewTimetableRowArrival data={data} />
				</div>
			</div>

		</>
	);
}
