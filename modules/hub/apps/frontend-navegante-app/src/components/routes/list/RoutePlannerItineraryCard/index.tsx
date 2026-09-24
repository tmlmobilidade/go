'use client';

import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { LiveIcon } from '@/components/common/display/LiveIcon';
import { useLinesData } from '@/components/lines/use-lines-data';
import { RoutePlannerItineraryLegStrip } from '@/components/routes/common/RoutePlannerItineraryLegStrip';
import { RoutePlannerGoButton } from '@/components/routes/navigation/RoutePlannerGoButton';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner/itinerary/alerts';
import { getRoutePlannerItineraryRealtimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { getItineraryWalkMinutes } from '@/utils/route-planner/planning/results';
import { formatMotisPlanDuration, formatMotisPlanTime } from '@/utils/route-planner/presentation/format';
import { getRoutePlannerTransitLegLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { IconAlertTriangle, IconWalk } from '@tabler/icons-react';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryCardProps {
	isSelected?: boolean
	itinerary: MotisItinerary
	onSelect: () => void
	onStartTrip: () => void
}

/* * */

export function RoutePlannerItineraryCard({ isSelected = false, itinerary, onSelect, onStartTrip }: RoutePlannerItineraryCardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: alerts } = useAlertsData();
	const { data: lines } = useLinesData();

	//
	// B. Transform data

	const legs = itinerary.legs;
	const start = itinerary.startTime;
	const end = itinerary.endTime;
	const duration = formatMotisPlanDuration(itinerary.duration);
	const walkingMinutes = getItineraryWalkMinutes(itinerary);

	const realtimeStatus = useMemo(() => {
		return getRoutePlannerItineraryRealtimeStatus(legs);
	}, [legs]);
	const itineraryAlertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(itinerary, lines);
	}, [itinerary, lines]);
	const itineraryAlerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(alerts, itineraryAlertFilters);
	}, [alerts, itineraryAlertFilters]);

	const effectiveStart = realtimeStatus.start_time?.effective_time ?? start;
	const effectiveEnd = realtimeStatus.end_time?.effective_time ?? end;
	const plannedEnd = realtimeStatus.end_time?.planned_time ?? end;
	const hasRealtimeRange = realtimeStatus.is_realtime;
	const effectiveStartLabel = formatMotisPlanTime(effectiveStart);
	const effectiveEndLabel = formatMotisPlanTime(effectiveEnd);
	const plannedEndLabel = formatMotisPlanTime(plannedEnd);
	const hasChangedArrival = hasRealtimeRange && effectiveEndLabel !== plannedEndLabel;
	const arrivalStatus = getArrivalStatus(realtimeStatus.arrival_delay_seconds, hasChangedArrival);
	const modeLabels = legs
		.filter(leg => !isMotisWalkingLeg(leg))
		.map(leg => getRoutePlannerTransitLegLabel(leg, mode => t(`default:routes.RoutePlanner.results.mode_labels.${mode}`)))
		.join(', ');
	const itinerarySummary = [
		t('default:routes.RoutePlanner.results.time_range', '', { end: effectiveEndLabel, start: effectiveStartLabel }),
		duration || t('default:routes.RoutePlanner.results.duration_unavailable'),
		modeLabels || t('default:routes.RoutePlanner.results.walk_label'),
		t('default:routes.RoutePlanner.results.transfers', '', { count: itinerary.transfers }),
		t('default:routes.RoutePlanner.results.walking_time', '', { count: walkingMinutes }),
		hasRealtimeRange ? t('default:routes.RoutePlanner.results.realtime') : null,
		hasChangedArrival ? t('default:routes.RoutePlanner.results.scheduled_at', '', { time: plannedEndLabel }) : null,
		itineraryAlerts.length > 0 ? t('default:routes.RoutePlanner.results.alerts', '', { count: itineraryAlerts.length }) : null,
	].filter(Boolean).join(', ');
	const selectItineraryLabel = t('default:routes.RoutePlanner.results.select_itinerary_aria_label', '', { summary: itinerarySummary });

	//
	// C. Render components

	return (
		<article className={styles.card} data-selected={isSelected}>
			<button
				aria-pressed={isSelected}
				className={styles.selectButton}
				onClick={onSelect}
				type="button"
			>
				<span className={styles.visuallyHidden}>{selectItineraryLabel}</span>
			</button>

			<div aria-hidden="true" className={styles.topRow}>
				<div className={styles.duration}>
					<strong>{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}</strong>
				</div>

				<div className={styles.timeRange} data-arrival-status={arrivalStatus} data-realtime={hasRealtimeRange}>
					<div className={styles.primaryTime}>
						<strong>{formatTimeRange(effectiveStart, effectiveEnd)}</strong>
						{hasRealtimeRange && (
							<span className={styles.liveStatus}>
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
				<div aria-hidden="true" className={styles.strip}>
					<RoutePlannerItineraryLegStrip itinerary={itinerary} />
				</div>
				<div className={styles.goAction}>
					<RoutePlannerGoButton
						ariaLabel={t('default:routes.RoutePlanner.results.start_route_aria_label')}
						onClick={onStartTrip}
					/>
				</div>
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
