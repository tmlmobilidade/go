'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerItineraryLegStrip } from '@/components/routes/RoutePlannerItineraryLegStrip';
import { RoutePlannerTime } from '@/components/routes/RoutePlannerTime';
import { useLinesByShortName } from '@/hooks/useLinesByShortName';
import { useRoutePlannerActiveLeg } from '@/hooks/useRoutePlannerActiveLeg';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { formatMotisPlanDuration, formatMotisPlanDurationMinutes, getMotisItineraryDurationSeconds, getMotisItineraryEnd, getMotisLegDurationSeconds, getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg, type MotisPlanIntermediateStop, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { getRoutePlannerIntermediateStopRealtimeStatus, getRoutePlannerItineraryRealtimeStatus, getRoutePlannerLegRealtimeStatus } from '@/utils/route-planner-realtime';
import { IconAlertTriangle, IconChevronDown, IconNavigationTop } from '@tabler/icons-react';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerItineraryDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsContext = useAlertsContext();
	const lineByShortName = useLinesByShortName();
	const routePlannerContext = useRoutePlannerContext();
	const { activeLegIndex } = useRoutePlannerActiveLeg();

	//
	// B. Transform data

	const itinerary = routePlannerContext.data.selected_itinerary;
	const isNavigating = routePlannerContext.flags.is_navigating;
	const legs = useMemo(() => Array.isArray(itinerary?.legs) ? itinerary.legs : [], [itinerary?.legs]);
	const duration = itinerary ? formatMotisPlanDuration(getMotisItineraryDurationSeconds(itinerary)) : null;
	const end = itinerary ? getMotisItineraryEnd(itinerary) : undefined;
	const routeDestinationLabel = routePlannerContext.data.destination?.label ?? t('default:routes.RoutePlanner.results.destination');
	const routeOriginLabel = routePlannerContext.data.origin?.label ?? t('default:routes.RoutePlanner.results.origin');
	const realtimeStatus = useMemo(() => {
		return getRoutePlannerItineraryRealtimeStatus(legs);
	}, [legs]);
	const effectiveEnd = realtimeStatus.end_time?.effective_time ?? end;
	const plannedEnd = realtimeStatus.end_time?.planned_time ?? end;
	const arrivalTime = {
		effective_time: effectiveEnd,
		is_realtime: realtimeStatus.is_realtime,
		planned_time: plannedEnd,
	};

	//
	// C. Render components

	if (!itinerary) return null;

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<strong className={styles.duration}>
					{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}
				</strong>
				<span className={styles.arrival}>
					<span>{t('default:routes.RoutePlanner.results.arrival_time_prefix')}</span>
					<RoutePlannerTime time={arrivalTime} />
				</span>
				<RoutePlannerItineraryLegStrip itinerary={itinerary} />
			</header>

			{isNavigating && (
				<div className={styles.actions}>
					<button
						className={styles.endButton}
						onClick={routePlannerContext.actions.endActiveTrip}
						type="button"
					>
						{t('default:routes.RoutePlanner.results.end_trip')}
					</button>
				</div>
			)}

			<ol className={styles.timeline}>
				{legs.map((leg, index) => (
					<RoutePlannerItineraryDetailLeg
						key={`${getLegPlaceName(leg.from, routeOriginLabel, routeOriginLabel, routeDestinationLabel)}-${getLegPlaceName(leg.to, routeDestinationLabel, routeOriginLabel, routeDestinationLabel)}-${index}`}
						alertsContext={alertsContext}
						isActive={isNavigating && index === activeLegIndex}
						leg={leg}
						lineByShortName={lineByShortName}
						routeDestinationLabel={routeDestinationLabel}
						routeOriginLabel={routeOriginLabel}
					/>
				))}
			</ol>
		</div>
	);

	//
}

/* * */

interface RoutePlannerItineraryDetailLegProps {
	alertsContext: ReturnType<typeof useAlertsContext>
	isActive: boolean
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	routeDestinationLabel: string
	routeOriginLabel: string
}

function RoutePlannerItineraryDetailLeg({ alertsContext, isActive, leg, lineByShortName, routeDestinationLabel, routeOriginLabel }: RoutePlannerItineraryDetailLegProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isStopsExpanded, setIsStopsExpanded] = useState(false);

	//
	// B. Transform data

	const from = getLegPlaceName(leg.from, routeOriginLabel, routeOriginLabel, routeDestinationLabel);
	const to = getLegPlaceName(leg.to, routeDestinationLabel, routeOriginLabel, routeDestinationLabel);
	const durationMinutes = formatMotisPlanDurationMinutes(getMotisLegDurationSeconds(leg));
	const intermediateStops = getIntermediateStops(leg);
	const hasIntermediateStops = intermediateStops.length > 0;
	const realtimeStatus = getRoutePlannerLegRealtimeStatus(leg);
	const delaySeconds = realtimeStatus.delay_seconds;
	const legAlertFilters = useMemo(() => {
		if (isMotisWalkingLeg(leg)) return null;
		return getRoutePlannerItineraryAlertFilters({ legs: [leg] }, Array.from(lineByShortName.values()));
	}, [leg, lineByShortName]);

	const alerts = useMemo(() => {
		if (isMotisWalkingLeg(leg)) return [];
		return filterAlertsByRoutePlannerItinerary(alertsContext.data.alerts, legAlertFilters);
	}, [alertsContext.data.alerts, leg, legAlertFilters]);

	//
	// C. Render components

	return (
		<li aria-current={isActive ? 'step' : undefined} className={styles.leg}>
			<div className={styles.legIcon} data-mode={getMotisLegModeKind(leg)}>
				<RoutePlannerModeIcon leg={leg} size={18} />
				{isActive && (
					<span
						aria-label={t('default:routes.RoutePlanner.results.current_step')}
						className={styles.currentStepMarker}
						role="img"
					>
						<IconNavigationTop size={12} stroke={3} />
					</span>
				)}
			</div>

			<div className={styles.legBody}>
				<div className={styles.legHeader}>
					<RoutePlannerLegBadge leg={leg} lineByShortName={lineByShortName} />
					{durationMinutes !== null && (
						<span className={styles.durationChip}>
							{t('default:routes.RoutePlanner.results.leg_duration', '', { count: durationMinutes })}
						</span>
					)}
				</div>

				{isMotisWalkingLeg(leg) ? (
					<p className={styles.instruction}>
						{t('default:routes.RoutePlanner.results.walk_between', '', { from, to })}
					</p>
				) : (
					<>
						<p className={styles.instruction}>
							{t('default:routes.RoutePlanner.results.ride_between', '', { from, to })}
						</p>
						{leg.headsign && <p className={styles.headsign}>{leg.headsign}</p>}
					</>
				)}

				<div className={styles.legEndpoints}>
					<span><RoutePlannerTime time={realtimeStatus.from_time} /> · {from}</span>
					<span><RoutePlannerTime time={realtimeStatus.to_time} /> · {to}</span>
				</div>

				{(delaySeconds !== 0 || alerts.length > 0) && (
					<div className={styles.warningList}>
						{delaySeconds !== 0 && (
							<div className={styles.warningItem} data-kind={delaySeconds > 0 ? 'late' : 'early'}>
								<IconAlertTriangle size={15} />
								<span>{formatDelayDescription(delaySeconds)}</span>
							</div>
						)}

						{alerts.slice(0, 3).map(alert => (
							<div key={alert._id} className={styles.warningItem} data-kind="alert">
								<IconAlertTriangle size={15} />
								<span>{alert.title}</span>
							</div>
						))}
					</div>
				)}

				{hasIntermediateStops && (
					<div className={styles.stops}>
						<button
							aria-expanded={isStopsExpanded}
							className={styles.stopsButton}
							onClick={() => setIsStopsExpanded(current => !current)}
							type="button"
						>
							{t('default:routes.RoutePlanner.results.intermediate_stops', '', { count: intermediateStops.length })}
							<IconChevronDown size={16} />
						</button>

						{isStopsExpanded && (
							<ol className={styles.stopList}>
								{intermediateStops.map((stop, index) => (
									<li key={`${getStopName(stop)}-${index}`}>
										<RoutePlannerTime time={getRoutePlannerIntermediateStopRealtimeStatus(stop, leg.realTime)} />
										<strong>{getStopName(stop)}</strong>
									</li>
								))}
							</ol>
						)}
					</div>
				)}
			</div>
		</li>
	);

	//
}

/* * */

interface RoutePlannerLegBadgeProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
}

function RoutePlannerLegBadge({ leg, lineByShortName }: RoutePlannerLegBadgeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const label = isMotisWalkingLeg(leg) ? t('default:routes.RoutePlanner.results.walk_label') : getMotisLegRouteLabel(leg);
	const lineData = lineByShortName.get(label);

	//
	// C. Render components

	if (!isMotisWalkingLeg(leg) && lineData) return <LineBadge lineData={lineData} size="md" />;

	return (
		<span className={styles.linePill} data-mode={getMotisLegModeKind(leg)}>
			{label}
		</span>
	);

	//
}

/* * */

function getIntermediateStops(leg: MotisPlanLeg) {
	return (leg.intermediateStops ?? []).filter(stop => getStopName(stop));
}

function getLegPlaceName(place: MotisPlanLeg['from'], fallbackLabel: string, routeOriginLabel: string, routeDestinationLabel: string) {
	const placeName = place.name;

	if (placeName === 'START') return routeOriginLabel;
	if (placeName === 'END') return routeDestinationLabel;

	return placeName || fallbackLabel;
}

function getStopName(stop: MotisPlanIntermediateStop) {
	return stop.name || '';
}

function formatDelayDescription(delaySeconds: number) {
	const absoluteMinutes = Math.max(1, Math.round(Math.abs(delaySeconds) / 60));
	if (delaySeconds > 0) return `Atraso de ${absoluteMinutes} min`;
	return `${absoluteMinutes} min adiantado`;
}
