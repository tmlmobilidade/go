'use client';

/* * */

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { NextArrivals } from '@/components/stops/detail/NextArrivals';
import { isRealtimeArrival, type StopTimetableRealtimeArrival } from '@/components/stops/detail/parse-eta-gtfs';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { type HubArrival } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	arrivalData: HubArrival | StopTimetableRealtimeArrival
	status: 'future' | 'passed' | 'realtime' | 'scheduled'
}

/* * */

export function StopsDetailContentTimetableRow({ arrivalData, status }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopsDetailContext = useStopsDetailContext();
	const operationalDate = useOperationalDate();

	const selectedDate = operationalDate.selectedOperationalDate;

	//
	// B. Transform data

	const isSelected = useMemo(() => {
		const isSameTripId = stopsDetailContext.data.active_trip_id === arrivalData.trip_id;
		const isSameStopSequence = stopsDetailContext.data.active_stop_sequence === arrivalData.stop_sequence;
		return isSameTripId && isSameStopSequence;
	}, [stopsDetailContext.data.active_trip_id, stopsDetailContext.data.active_stop_sequence, arrivalData.trip_id, arrivalData.stop_sequence]);

	const thisPattern = useMemo(
		() => stopsDetailContext.data.valid_pattern_groups?.find(pattern => pattern.id === arrivalData.pattern_id),
		[arrivalData.pattern_id, stopsDetailContext.data.valid_pattern_groups],
	);

	const scheduledArrivalUnix = useMemo(() => {
		if (isRealtimeArrival(arrivalData)) {
			return arrivalData.scheduled_arrival_unix;
		}

		const [hours, minutes, seconds = 0] = arrivalData.arrival_time_24h.split(':').map(Number);
		return DateTime.local().set({ hour: hours, millisecond: 0, minute: minutes, second: seconds }).toUnixInteger();
	}, [arrivalData]);

	//
	// C. Handle actions

	const handleSelectTrip = useCallback(() => {
		if (isSelected) {
			stopsDetailContext.actions.resetActiveTripId();
			return;
		}
		stopsDetailContext.actions.setActiveTripId(arrivalData.trip_id, arrivalData.stop_sequence);
	}, [arrivalData.stop_sequence, arrivalData.trip_id, isSelected, stopsDetailContext.actions]);

	//
	// D. Render components

	if (!thisPattern) {
		return null;
	}

	// Schedule row — static arrival time from pattern
	return (
		<div className={`${styles.container} ${styles[status]} ${isSelected && styles.isSelected}`} onClick={handleSelectTrip}>

			<div className={styles.summary}>
				<LineDisplay
					color={thisPattern.color}
					longName={thisPattern.headsign}
					shortName={thisPattern.short_name}
					textColor={thisPattern.text_color}
				/>
				<NextArrivals
					arrivals={[scheduledArrivalUnix]}
					status={status === 'passed' ? 'passed' : arrivalData.is_realtime ? 'realtime' : 'scheduled'}
					tripId={arrivalData.trip_id}
					withIcon={true}
				/>
			</div>

			{isSelected && (
				<>
					<Link className={styles.openLinePage} href={`/lines/${arrivalData.line_id}?&day=${selectedDate}&active_pattern_id=${thisPattern?.id}`} onClick={e => e.stopPropagation()} target="_blank">{t('default:stops.StopsDetailContentTimetableRow.open_line_page')}</Link>
					<div className={styles.details}>
						{thisPattern.locality_ids.length > 0 && (
							<div className={styles.localitiesListWrapper}>
								<p className={styles.localitiesLabel}>{t('default:stops.StopsDetailContentTimetableRow.localities.label')}</p>
								<p>
									{thisPattern.locality_ids.map((localityId, index) => (
										<span key={index}>
											{index > 0 && <span className={styles.localitySeparator}> • </span>}
											<span className={styles.localityName}>TBD</span>
										</span>
									))}
								</p>
							</div>
						)}
					</div>
				</>
			)}

		</div>
	);
}
