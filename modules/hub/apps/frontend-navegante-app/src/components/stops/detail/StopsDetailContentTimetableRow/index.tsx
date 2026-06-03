// 'use client';

// /* * */

// import { LineDisplay } from '@/components/lines/common/LineDisplay';
// import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
// import { useLocationsContext } from '@/components/stops/Locations.context';
// import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
// import { type HubArrival, type HubArrivalStatus } from '@tmlmobilidade/types';
// import Link from 'next/link';
// import { useCallback, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';

// import styles from './styles.module.css';

// /* * */

// interface Props {
// 	arrivalData: HubArrival
// 	status: HubArrivalStatus
// }

// /* * */

// export function StopsDetailContentTimetableRow({ arrivalData, status }: Props) {
// 	//

// 	//
// 	// A. Setup variables

// 	const { t } = useTranslation();
// 	const stopsDetailContext = useStopsDetailContext();
// 	const locationsContext = useLocationsContext();

// 	const operationalDateContext = useOperationalDateContext();
// 	const selectedDate = operationalDateContext.data.selected_date;

// 	//
// 	// B. Transform data

// 	const isSelected = useMemo(() => {
// 		const isSameTripId = stopsDetailContext.data.active_trip_id === arrivalData.trip_id;
// 		const isSameStopSequence = stopsDetailContext.data.active_stop_sequence === arrivalData.stop_sequence;
// 		return isSameTripId && isSameStopSequence;
// 	}, [stopsDetailContext.data.active_trip_id, stopsDetailContext.data.active_stop_sequence, arrivalData.trip_id, arrivalData.stop_sequence]);

// 	// This is needed to avoid rerendering the component when the time changes
// 	const thisPattern = stopsDetailContext.data.valid_pattern_groups?.find(pattern => pattern.id === arrivalData.pattern_id);

// 	//
// 	// C. Handle actions

// 	const handleSelectTrip = useCallback(() => {
// 		if (isSelected) {
// 			stopsDetailContext.actions.resetActiveTripId();
// 			return;
// 		}
// 		stopsDetailContext.actions.setActiveTripId(arrivalData.trip_id, arrivalData.stop_sequence);
// 	}, [arrivalData.trip_id, arrivalData.stop_sequence, stopsDetailContext.actions.setActiveTripId]);

// 	//
// 	// D. Render components

// 	if (!thisPattern) {
// 		return null;
// 	}

// 	return (
// 		<div className={`${styles.container} ${styles[status]} ${isSelected && styles.isSelected}`} onClick={handleSelectTrip}>

// 			<div className={styles.summary}>
// 				<LineDisplay
// 					color={thisPattern.color}
// 					longName={thisPattern.headsign}
// 					shortName={thisPattern.line_id}
// 					textColor={thisPattern.text_color}
// 				/>
// 				<NextArrivals
// 					arrivals={[arrivalData.observed_arrival_unix || arrivalData.scheduled_arrival_unix]}
// 					status={status}
// 					tripId={arrivalData.trip_id}
// 					withIcon={true}
// 				/>
// 			</div>

// 			{isSelected && (
// 				<div className={styles.details}>
// 					<Link className={styles.openLinePage} href={`/lines/${arrivalData.line_id}?&day=${selectedDate?.operational_date}&active_pattern_id=${thisPattern?.id}`} onClick={e => e.stopPropagation()} target="_blank">{t('open_line_page')}</Link>
// 					{thisPattern.locality_ids.length > 0 && (
// 						<div className={styles.localitiesListWrapper}>
// 							<p className={styles.localitiesLabel}>{t('default:stops.StopsDetailContentTimetableRow.localities.label')}</p>
// 							<p>
// 								{thisPattern.locality_ids.map((localityId, index) => (
// 									<span key={index}>
// 										{index > 0 && <span className={styles.localitySeparator}> • </span>}
// 										<span className={styles.localityName}>{locationsContext.actions.getLocalityById(localityId)?.name}</span>
// 									</span>
// 								))}
// 							</p>
// 						</div>
// 					)}
// 				</div>
// 			)}

// 		</div>
// 	);
// }
