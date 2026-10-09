'use client';

import { RoutePlannerLinePill } from '@/components/routes/common/RoutePlannerLinePill';
import { RoutePlannerModeBadge } from '@/components/routes/common/RoutePlannerModeBadge';
import { RoutePlannerTime } from '@/components/routes/common/RoutePlannerTime';
import { RoutePlannerItineraryDetailStep } from '@/components/routes/detail/RoutePlannerItineraryDetailStep';
import { filterAlertsByRoutePlannerItinerary, getRoutePlannerItineraryAlertFilters } from '@/utils/route-planner/itinerary/alerts';
import { getRoutePlannerIntermediateStopRealtimeStatus, getRoutePlannerLegRealtimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { getDurationMinutes } from '@/utils/route-planner/presentation/format';
import { getMotisLegRouteLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { IconAlertTriangle, IconChevronDown } from '@tabler/icons-react';
import { type HubV1ApiAlert, type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { type MotisPlanLeg, type MotisPlanPlace } from '@tmlmobilidade/go-types-motis';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryDetailLegProps {
	alerts: HubV1ApiAlert[]
	isActive: boolean
	isFinalDestination: boolean
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubV1ApiLine>
	routeDestinationLabel: string
	routeOriginLabel: string
	showDestination?: boolean
	showOrigin?: boolean
}

/* * */

export function RoutePlannerItineraryDetailLeg({ alerts: allAlerts, isActive, isFinalDestination, leg, lineByShortName, routeDestinationLabel, routeOriginLabel, showDestination = true, showOrigin = true }: RoutePlannerItineraryDetailLegProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isStopsExpanded, setIsStopsExpanded] = useState(false);

	//
	// B. Transform data

	const from = getRoutePlannerLegPlaceName(leg.from, routeOriginLabel, routeOriginLabel, routeDestinationLabel);
	const to = getRoutePlannerLegPlaceName(leg.to, routeDestinationLabel, routeOriginLabel, routeDestinationLabel);
	const durationMinutes = getDurationMinutes(leg.duration);
	const intermediateStops = getIntermediateStops(leg);
	const hasIntermediateStops = intermediateStops.length > 0;
	const lineData = lineByShortName.get(getMotisLegRouteLabel(leg));
	const lineColor = isMotisWalkingLeg(leg) ? undefined : lineData?.color || 'var(--color-route-line-fallback)';
	const realtimeStatus = getRoutePlannerLegRealtimeStatus(leg);
	const legAlertFilters = useMemo(() => {
		if (isMotisWalkingLeg(leg)) return null;
		return getRoutePlannerItineraryAlertFilters({ legs: [leg] }, Array.from(lineByShortName.values()));
	}, [leg, lineByShortName]);

	const alerts = useMemo(() => {
		if (isMotisWalkingLeg(leg)) return [];
		return filterAlertsByRoutePlannerItinerary(allAlerts, legAlertFilters);
	}, [allAlerts, leg, legAlertFilters]);

	//
	// C. Render components

	return (
		<RoutePlannerItineraryDetailStep
			isActive={isActive}
			lineColor={lineColor}
			marker={showOrigin ? <span aria-hidden="true" className={styles.endpointNode} /> : <RoutePlannerModeBadge leg={leg} size="md" />}
			endMarker={showDestination && (
				<span
					aria-hidden={!isFinalDestination}
					aria-label={isFinalDestination ? t('default:routes.RoutePlanner.results.arrival_at_destination') : undefined}
					className={styles.endpointNode}
					data-final-destination={isFinalDestination}
					role={isFinalDestination ? 'img' : undefined}
				/>
			)}
		>

			<div className={styles.legEndpoints}>
				{showOrigin && (
					<div className={styles.endpoint} data-origin="true">
						<div className={styles.endpointPlace}>
							<strong>{from}</strong>
						</div>
						<span className={styles.endpointTime}><RoutePlannerTime time={realtimeStatus.from_time} /></span>
					</div>
				)}
				<div className={styles.legHeader}>
					{showOrigin && <div className={styles.modeMarker}><RoutePlannerModeBadge leg={leg} size="md" /></div>}
					{!isMotisWalkingLeg(leg) && (
						<div className={styles.lineDirection}>
							<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} size="md" openLineDetails />
							{!isMotisWalkingLeg(leg) && leg.headsign && (
								<span aria-label={t('default:routes.RoutePlanner.results.direction', '', { headsign: leg.headsign })} className={styles.headsign}>
									{leg.headsign}
								</span>
							)}
						</div>
					)}
					{durationMinutes !== null && durationMinutes > 0 && (
						<span className={styles.durationChip}>
							{t('default:routes.RoutePlanner.results.leg_duration', '', { count: durationMinutes })}
						</span>
					)}
				</div>

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
										<strong>{getStopName(stop)}</strong>
										<span className={styles.intermediateTime}><RoutePlannerTime time={getRoutePlannerIntermediateStopRealtimeStatus(stop, leg.realTime)} /></span>
									</li>
								))}
							</ol>
						)}
					</div>
				)}
				{alerts.length > 0 && (
					<div className={styles.warningList}>
						{alerts.slice(0, 3).map(alert => (
							<div key={alert._id} className={styles.warningItem} data-kind="alert">
								<IconAlertTriangle size={15} />
								<span>{alert.title}</span>
							</div>
						))}
					</div>
				)}

				{showDestination && (
					<div className={styles.endpoint} data-destination="true">
						<div className={styles.endpointPlace}>
							<strong>{to}</strong>
						</div>
						<span className={styles.endpointTime}><RoutePlannerTime time={realtimeStatus.to_time} /></span>
					</div>
				)}
			</div>

		</RoutePlannerItineraryDetailStep>
	);

	//
}

/* * */

export function getRoutePlannerLegPlaceName(place: MotisPlanLeg['from'], fallbackLabel: string, routeOriginLabel: string, routeDestinationLabel: string) {
	const placeName = place.name;

	if (placeName === 'START') return routeOriginLabel;
	if (placeName === 'END') return routeDestinationLabel;

	return placeName || fallbackLabel;
}

function getIntermediateStops(leg: MotisPlanLeg) {
	return (leg.intermediateStops ?? []).filter(stop => getStopName(stop));
}

function getStopName(stop: MotisPlanPlace) {
	return stop.name || '';
}
