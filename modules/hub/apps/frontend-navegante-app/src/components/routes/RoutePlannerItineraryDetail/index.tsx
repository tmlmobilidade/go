'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useTripUpdatesContext } from '@/components/trip-updates/TripUpdates.context';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { formatMotisPlanDuration, formatMotisPlanDurationMinutes, formatMotisPlanTime, getMotisItineraryDurationSeconds, getMotisItineraryEnd, getMotisItineraryStart, getMotisLegDurationSeconds, getMotisLegModeKind, getMotisLegRouteLabel, getMotisLegTripIds, getMotisPlanPlaceStopId, isMotisWalkingLeg, type MotisPlanIntermediateStop, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconAlertTriangle, IconBike, IconBus, IconCar, IconChevronDown, IconElevator, IconFerry, IconPlane, IconRoute, IconScooter, IconTrain, IconWalk } from '@tabler/icons-react';
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
	const linesContext = useLinesContext();
	const routePlannerContext = useRoutePlannerContext();
	const tripUpdatesContext = useTripUpdatesContext();

	//
	// B. Transform data

	const itinerary = routePlannerContext.data.selected_itinerary;
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const duration = itinerary ? formatMotisPlanDuration(getMotisItineraryDurationSeconds(itinerary)) : null;
	const start = itinerary ? getMotisItineraryStart(itinerary) : undefined;
	const end = itinerary ? getMotisItineraryEnd(itinerary) : undefined;
	const routeDestinationLabel = routePlannerContext.data.destination?.label ?? t('default:routes.RoutePlanner.results.destination');
	const routeOriginLabel = routePlannerContext.data.origin?.label ?? t('default:routes.RoutePlanner.results.origin');

	const lineByShortName = useMemo(() => {
		return new Map(linesContext.data.lines.map(line => [line.short_name, line]));
	}, [linesContext.data.lines]);

	//
	// C. Render components

	if (!itinerary) return null;

	return (
		<div className={styles.container}>
			<header className={styles.summary}>
				<strong>{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}</strong>
				<span>{formatMotisPlanTime(start)}{' -> '}{formatMotisPlanTime(end)}</span>
			</header>

			<ol className={styles.timeline}>
				{legs.map((leg, index) => (
					<RoutePlannerItineraryDetailLeg
						key={`${getLegPlaceName(leg.from, routeOriginLabel, routeOriginLabel, routeDestinationLabel)}-${getLegPlaceName(leg.to, routeDestinationLabel, routeOriginLabel, routeDestinationLabel)}-${index}`}
						alertsContext={alertsContext}
						leg={leg}
						lineByShortName={lineByShortName}
						routeDestinationLabel={routeDestinationLabel}
						routeOriginLabel={routeOriginLabel}
						tripUpdatesContext={tripUpdatesContext}
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
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	routeDestinationLabel: string
	routeOriginLabel: string
	tripUpdatesContext: ReturnType<typeof useTripUpdatesContext>
}

function RoutePlannerItineraryDetailLeg({ alertsContext, leg, lineByShortName, routeDestinationLabel, routeOriginLabel, tripUpdatesContext }: RoutePlannerItineraryDetailLegProps) {
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
	const delaySeconds = getLegRealtimeDelay(leg, tripUpdatesContext);
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
		<li className={styles.leg}>
			<div className={styles.legIcon} data-mode={getMotisLegModeKind(leg)}>
				<RoutePlannerModeIcon leg={leg} size={18} />
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
					<span>{formatMotisPlanTime(leg.startTime)} · {from}</span>
					<span>{formatMotisPlanTime(leg.endTime)} · {to}</span>
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
										<span>{formatMotisPlanTime(getIntermediateStopTime(stop))}</span>
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

function RoutePlannerModeIcon({ leg, size }: { leg: MotisPlanLeg, size: number }) {
	const modeKind = getMotisLegModeKind(leg);

	if (modeKind === 'walk') return <IconWalk size={size} />;
	if (modeKind === 'bus') return <IconBus size={size} />;
	if (modeKind === 'bike') return <IconBike size={size} />;
	if (modeKind === 'car') return <IconCar size={size} />;
	if (modeKind === 'ferry') return <IconFerry size={size} />;
	if (modeKind === 'plane') return <IconPlane size={size} />;
	if (modeKind === 'scooter') return <IconScooter size={size} />;
	if (modeKind === 'elevator') return <IconElevator size={size} />;
	if (modeKind === 'transit') return <IconRoute size={size} />;

	return <IconTrain size={size} />;
}

/* * */

function getIntermediateStops(leg: MotisPlanLeg) {
	return (leg.intermediateStops ?? []).filter(stop => getStopName(stop));
}

function getIntermediateStopTime(stop: MotisPlanIntermediateStop) {
	return stop.departure || stop.arrival || stop.scheduledDeparture || stop.scheduledArrival;
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

function getLegRealtimeDelay(leg: MotisPlanLeg, tripUpdatesContext: ReturnType<typeof useTripUpdatesContext>) {
	const tripIds = getMotisLegTripIds(leg);
	if (tripIds.length === 0) return 0;

	const updates = [getMotisPlanPlaceStopId(leg.from), getMotisPlanPlaceStopId(leg.to)]
		.filter((stopId): stopId is string => typeof stopId === 'string' && stopId.length > 0)
		.map(stopId => tripUpdatesContext.actions.getTripUpdateForStop(tripIds, stopId))
		.filter(Boolean);

	return updates.reduce((selectedDelay, update) => {
		if (!update) return selectedDelay;
		if (Math.abs(update.delay) <= Math.abs(selectedDelay)) return selectedDelay;
		return update.delay;
	}, 0);
}

function formatDelayDescription(delaySeconds: number) {
	const absoluteMinutes = Math.max(1, Math.round(Math.abs(delaySeconds) / 60));
	if (delaySeconds > 0) return `Atraso de ${absoluteMinutes} min`;
	return `${absoluteMinutes} min adiantado`;
}
