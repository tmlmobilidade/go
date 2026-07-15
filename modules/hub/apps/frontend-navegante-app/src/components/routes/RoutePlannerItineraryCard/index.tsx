'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useTripUpdatesContext } from '@/components/trip-updates/TripUpdates.context';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner-alerts';
import { formatMotisPlanDuration, formatMotisPlanDurationMinutes, formatMotisPlanTime, getMotisItineraryDurationSeconds, getMotisItineraryEnd, getMotisItineraryStart, getMotisItineraryWalkMinutes, getMotisLegDurationSeconds, getMotisLegMode, getMotisLegModeKind, getMotisLegRouteLabel, getMotisLegTripIds, getMotisPlanPlaceStopId, isMotisWalkingLeg, type MotisItinerary, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconAlertTriangle, IconArrowRight, IconBike, IconBus, IconCar, IconElevator, IconFerry, IconPlane, IconRoute, IconScooter, IconTrain, IconWalk } from '@tabler/icons-react';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { type MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryCardProps {
	isSelected?: boolean
	itinerary: MotisItinerary
	onOpenDetails?: () => void
	onSelect?: () => void
}

/* * */

export function RoutePlannerItineraryCard({ isSelected = false, itinerary, onOpenDetails, onSelect }: RoutePlannerItineraryCardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertsContext = useAlertsContext();
	const linesContext = useLinesContext();
	const tripUpdatesContext = useTripUpdatesContext();

	//
	// B. Transform data

	const legs = useMemo(() => {
		return Array.isArray(itinerary.legs) ? itinerary.legs : [];
	}, [itinerary.legs]);
	const start = getMotisItineraryStart(itinerary);
	const end = getMotisItineraryEnd(itinerary);
	const duration = formatMotisPlanDuration(getMotisItineraryDurationSeconds(itinerary));
	const walkingMinutes = getMotisItineraryWalkMinutes(legs);
	const lineByShortName = useMemo(() => {
		return new Map(linesContext.data.lines.map(line => [line.short_name, line]));
	}, [linesContext.data.lines]);

	const realtimeStatus = useMemo(() => {
		return getItineraryRealtimeStatus(legs, tripUpdatesContext);
	}, [legs, tripUpdatesContext]);

	const itineraryAlertFilters = useMemo(() => {
		return getRoutePlannerItineraryAlertFilters(itinerary, linesContext.data.lines);
	}, [itinerary, linesContext.data.lines]);

	const itineraryAlerts = useMemo(() => {
		return filterAlertsByRoutePlannerItinerary(alertsContext.data.alerts, itineraryAlertFilters);
	}, [alertsContext.data.alerts, itineraryAlertFilters]);

	//
	// C. Handle actions

	const handleRouteActionClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onOpenDetails?.();
	};

	//
	// D. Render components

	return (
		<article className={styles.card} data-selected={isSelected} onClick={onSelect}>
			<div className={styles.topRow}>
				<div className={styles.duration}>
					<strong>{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}</strong>
				</div>

				<span className={styles.timeRange}>
					{formatMotisPlanTime(start)}
					{' -> '}
					{formatMotisPlanTime(end)}
				</span>

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

			{(realtimeStatus.delaySeconds !== 0 || itineraryAlerts.length > 0) && (
				<div className={styles.noticeRow}>
					{realtimeStatus.delaySeconds !== 0 && (
						<span className={styles.delayBadge} data-delay-kind={realtimeStatus.delaySeconds > 0 ? 'late' : 'early'}>
							{formatDelayLabel(realtimeStatus.delaySeconds)}
						</span>
					)}

				</div>
			)}

			<div className={styles.bottomRow}>
				<div
					aria-label={t('default:routes.RoutePlanner.results.route_summary')}
					className={styles.routeStrip}
				>
					{legs.map((leg, legIndex) => (
						<RoutePlannerLegStripItem
							key={`${getMotisLegMode(leg)}-${legIndex}`}
							leg={leg}
							lineByShortName={lineByShortName}
							showConnector={legIndex < legs.length - 1}
						/>
					))}
				</div>
				<button aria-label={t('default:routes.RoutePlanner.results.view_details')} className={styles.routeActionButton} onClick={handleRouteActionClick} type="button">
					{t('default:routes.RoutePlanner.results.start_route')}
					<IconArrowRight size={15} />
				</button>
			</div>

		</article>
	);

	//
}

/* * */

interface RoutePlannerLegStripItemProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	showConnector: boolean
}

function RoutePlannerLegStripItem({ leg, lineByShortName, showConnector }: RoutePlannerLegStripItemProps) {
	//

	//
	// A. Transform data

	const durationMinutes = formatMotisPlanDurationMinutes(getMotisLegDurationSeconds(leg));

	//
	// B. Render components

	return (
		<div className={styles.stripItem}>
			{isMotisWalkingLeg(leg) ? (
				<div className={styles.walkPill}>
					<IconWalk size={15} />
					{durationMinutes ? `${durationMinutes}'` : null}
				</div>
			) : (
				<>
					<div className={styles.modeIcon} data-mode={getMotisLegModeKind(leg)}>
						<RoutePlannerModeIcon leg={leg} size={16} />
					</div>
					<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} />
				</>
			)}
			{showConnector && <span className={styles.connector}>•••</span>}
		</div>
	);

	//
}

/* * */

interface RoutePlannerLinePillProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
}

function RoutePlannerLinePill({ leg, lineByShortName }: RoutePlannerLinePillProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const label = isMotisWalkingLeg(leg) ? t('default:routes.RoutePlanner.results.walk_label') : getMotisLegRouteLabel(leg);
	const modeKind = getMotisLegModeKind(leg);
	const lineData = lineByShortName.get(label);

	//
	// C. Render components

	if (!isMotisWalkingLeg(leg) && lineData) {
		return <LineBadge lineData={lineData} size="sm" />;
	}

	return (
		<span className={styles.linePill} data-mode={modeKind}>
			{label}
		</span>
	);

	//
}

interface RoutePlannerModeIconProps {
	leg: MotisPlanLeg
	size: number
}

function RoutePlannerModeIcon({ leg, size }: RoutePlannerModeIconProps) {
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

function getItineraryRealtimeStatus(legs: MotisPlanLeg[], tripUpdatesContext: ReturnType<typeof useTripUpdatesContext>) {
	const updates = legs.flatMap((leg) => {
		const tripIds = getMotisLegTripIds(leg);
		if (tripIds.length === 0) return [];

		return [getMotisPlanPlaceStopId(leg.from), getMotisPlanPlaceStopId(leg.to)]
			.filter((stopId): stopId is string => typeof stopId === 'string' && stopId.length > 0)
			.map(stopId => tripUpdatesContext.actions.getTripUpdateForStop(tripIds, stopId))
			.filter(Boolean);
	});

	const mostRelevantDelay = updates.reduce((selectedDelay, update) => {
		if (!update) return selectedDelay;
		if (Math.abs(update.delay) <= Math.abs(selectedDelay)) return selectedDelay;
		return update.delay;
	}, 0);

	return { delaySeconds: mostRelevantDelay };
}

function formatDelayLabel(delaySeconds: number) {
	const absoluteMinutes = Math.max(1, Math.round(Math.abs(delaySeconds) / 60));
	if (delaySeconds > 0) return `+${absoluteMinutes} min`;
	return `-${absoluteMinutes} min`;
}
