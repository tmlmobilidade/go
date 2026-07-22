'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { LiveIcon } from '@/components/common/display/LiveIcon';
import { useLinesContext } from '@/components/lines/Lines.context';
import { RoutePlannerItineraryLegStrip } from '@/components/routes/common/RoutePlannerItineraryLegStrip';
import { RoutePlannerGoButton } from '@/components/routes/navigation/RoutePlannerGoButton';
import { type MotisItinerary } from '@/types/route-planner';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner/alerts';
import { formatMotisPlanDuration, formatMotisPlanTime } from '@/utils/route-planner/format';
import { getMotisItineraryDurationSeconds, getMotisItineraryEnd, getMotisItineraryStart, getMotisItineraryWalkMinutes } from '@/utils/route-planner/motis-plan-api';
import { getRoutePlannerItineraryRealtimeStatus } from '@/utils/route-planner/realtime';
import { IconAlertTriangle, IconWalk } from '@tabler/icons-react';
import { type MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryCardProps {
	isSelected?: boolean
	itinerary: MotisItinerary
	onSelect?: () => void
	onStartTrip?: () => void
}

/* * */

export function RoutePlannerItineraryCard({ isSelected = false, itinerary, onSelect, onStartTrip }: RoutePlannerItineraryCardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsContext = useAlertsContext();
	const linesContext = useLinesContext();

	//
	// B. Transform data

	const legs = useMemo(() => {
		return Array.isArray(itinerary.legs) ? itinerary.legs : [];
	}, [itinerary.legs]);
	const start = getMotisItineraryStart(itinerary);
	const end = getMotisItineraryEnd(itinerary);
	const duration = formatMotisPlanDuration(getMotisItineraryDurationSeconds(itinerary));
	const walkingMinutes = getMotisItineraryWalkMinutes(legs);

	const realtimeStatus = useMemo(() => {
		return getRoutePlannerItineraryRealtimeStatus(legs);
	}, [legs]);
	const effectiveStart = realtimeStatus.start_time?.effective_time ?? start;
	const effectiveEnd = realtimeStatus.end_time?.effective_time ?? end;
	const plannedEnd = realtimeStatus.end_time?.planned_time ?? end;
	const hasRealtimeRange = realtimeStatus.is_realtime;
	const effectiveEndLabel = formatMotisPlanTime(effectiveEnd);
	const plannedEndLabel = formatMotisPlanTime(plannedEnd);
	const hasChangedArrival = hasRealtimeRange && effectiveEndLabel !== plannedEndLabel;
	const arrivalStatus = getArrivalStatus(realtimeStatus.arrival_delay_seconds, hasChangedArrival);

	const itineraryAlertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(itinerary, linesContext.data.lines);
	}, [itinerary, linesContext.data.lines]);

	const itineraryAlerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(alertsContext.data.alerts, itineraryAlertFilters);
	}, [alertsContext.data.alerts, itineraryAlertFilters]);

	//
	// C. Handle actions

	const handleStartTripClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onStartTrip?.();
	};

	//
	// D. Render components

	return (
		<article className={styles.card} data-selected={isSelected} onClick={onSelect}>
			<div className={styles.topRow}>
				<div className={styles.duration}>
					<strong>{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}</strong>
				</div>

				<div className={styles.timeRange} data-arrival-status={arrivalStatus} data-realtime={hasRealtimeRange}>
					<div className={styles.primaryTime}>
						<strong>{formatTimeRange(effectiveStart, effectiveEnd)}</strong>
						{hasRealtimeRange && (
							<span aria-label={t('default:routes.RoutePlanner.results.realtime')} className={styles.liveStatus}>
								<LiveIcon color={getLiveIndicatorColor(arrivalStatus)} />
							</span>
						)}
					</div>
					{hasChangedArrival && (
						<small>
							{t('default:routes.RoutePlanner.results.scheduled_at', '', { time: plannedEndLabel })}
						</small>
					)}
				</div>

				{itineraryAlerts.length > 0 && (
					<span className={styles.alertBadge}>
						<IconAlertTriangle size={14} />
					</span>
				)}

				<span className={styles.walkMetric}>
					<IconWalk size={18} />
					{t('default:routes.RoutePlanner.results.walking_time', '', { count: walkingMinutes })}
				</span>
			</div>

			<div className={styles.bottomRow}>
				<RoutePlannerItineraryLegStrip itinerary={itinerary} />
				<RoutePlannerGoButton
					ariaLabel={t('default:routes.RoutePlanner.results.start_route_aria_label')}
					onClick={handleStartTripClick}
				/>
			</div>

		</article>
	);

	//
}

type ArrivalStatus = 'early' | 'late' | 'on-time';

function getArrivalStatus(arrivalDelaySeconds: number, hasChangedArrival: boolean): ArrivalStatus {
	if (!hasChangedArrival) return 'on-time';
	return arrivalDelaySeconds > 0 ? 'late' : 'early';
}

function getLiveIndicatorColor(arrivalStatus: ArrivalStatus) {
	if (arrivalStatus === 'late') return 'var(--color-status-warning-primary)';
	if (arrivalStatus === 'early') return 'var(--color-status-success-primary)';
	return 'var(--color-status-active-primary)';
}

function formatTimeRange(start: number | string | undefined, end: number | string | undefined) {
	return `${formatMotisPlanTime(start)} → ${formatMotisPlanTime(end)}`;
}
