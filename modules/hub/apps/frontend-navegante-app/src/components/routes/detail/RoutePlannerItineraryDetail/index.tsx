'use client';

import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { RoutePlannerTime } from '@/components/routes/common/RoutePlannerTime';
import { RoutePlannerItineraryArrivalStep } from '@/components/routes/detail/RoutePlannerItineraryArrivalStep';
import { getRoutePlannerLegPlaceName, RoutePlannerItineraryDetailLeg } from '@/components/routes/detail/RoutePlannerItineraryDetailLeg';
import { RoutePlannerItineraryWaitStep } from '@/components/routes/detail/RoutePlannerItineraryWaitStep';
import { RoutePlannerGoButton } from '@/components/routes/navigation/RoutePlannerGoButton';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useLinesByShortName } from '@/hooks/route-planner/useLinesByShortName';
import { useRoutePlannerActiveLeg } from '@/hooks/route-planner/useRoutePlannerActiveLeg';
import { isSameRoutePlannerPlace } from '@/utils/route-planner/itinerary/places';
import { getRoutePlannerItineraryRealtimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { getItineraryWaitingMinutes, getRoutePlannerWaitingSteps } from '@/utils/route-planner/itinerary/waiting';
import { getItineraryWalkMinutes } from '@/utils/route-planner/planning/results';
import { formatMotisPlanDuration } from '@/utils/route-planner/presentation/format';
import { isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { IconClock, IconWalk } from '@tabler/icons-react';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerItineraryDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: alerts } = useAlertsData();
	const lineByShortName = useLinesByShortName();
	const routePlannerContext = useRoutePlannerContext();
	const { activeLegIndex } = useRoutePlannerActiveLeg();

	//
	// B. Transform data

	const itinerary = routePlannerContext.data.selected_itinerary;
	const isNavigating = routePlannerContext.flags.is_navigating;
	const legs = useMemo(() => itinerary?.legs ?? [], [itinerary?.legs]);
	const duration = formatMotisPlanDuration(itinerary?.duration);
	const walkingMinutes = itinerary ? getItineraryWalkMinutes(itinerary) : 0;
	const waitingMinutes = itinerary ? getItineraryWaitingMinutes(itinerary) : 0;
	const waitingByLegIndex = useMemo(() => new Map(itinerary ? getRoutePlannerWaitingSteps(itinerary).map(step => [step.before_leg_index, step]) : []), [itinerary]);
	const end = itinerary?.endTime;
	const routeDestinationLabel = routePlannerContext.data.destination?.label ?? t('default:routes.RoutePlanner.results.destination');
	const routeOriginLabel = routePlannerContext.data.origin?.label ?? t('default:routes.RoutePlanner.results.origin');
	const realtimeStatus = useMemo(() => {
		return getRoutePlannerItineraryRealtimeStatus(legs);
	}, [legs]);
	const departureTime = realtimeStatus.start_time ?? { effective_time: itinerary?.startTime, is_realtime: false, planned_time: itinerary?.startTime };
	const effectiveEnd = realtimeStatus.end_time?.effective_time ?? end;
	const lastPlace = legs.at(-1)?.to;
	const showDestinationStep = Boolean(lastPlace && getRoutePlannerLegPlaceName(lastPlace, routeDestinationLabel, routeOriginLabel, routeDestinationLabel) !== routeDestinationLabel);
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
		<div className={styles.container} data-preview={!isNavigating}>
			<header className={styles.header} data-preview={!isNavigating}>
				<div className={styles.journeySummary}>
					<span className={styles.journeyTime}><RoutePlannerTime time={departureTime} /></span>
					<span aria-hidden="true" className={styles.separator}>→</span>
					<span className={styles.journeyTime}><RoutePlannerTime time={arrivalTime} /></span>
					<strong className={styles.duration}>({duration || t('default:routes.RoutePlanner.results.duration_unavailable')})</strong>
				</div>
				{!isNavigating && (
					<div className={styles.metrics}>
						<span className={styles.metric}>
							<IconWalk aria-hidden="true" size={16} />
							{t('default:routes.RoutePlanner.results.walking_time', '', { count: walkingMinutes })}
						</span>
						<span className={styles.metric}>
							<IconClock aria-hidden="true" size={16} />
							{t('default:routes.RoutePlanner.results.waiting_time', '', { count: waitingMinutes })}
						</span>
					</div>
				)}
			</header>

			<div className={styles.actions}>
				{isNavigating ? (
					<button
						className={styles.endButton}
						onClick={routePlannerContext.actions.endActiveTrip}
						type="button"
					>
						{t('default:routes.RoutePlanner.results.end_trip')}
					</button>
				) : (
					<>
						<button className={styles.alternativesButton} onClick={routePlannerContext.actions.openResults} type="button">
							{t('default:routes.RoutePlanner.results.view_alternatives')}
						</button>
						{routePlannerContext.flags.can_start_trip && (
							<RoutePlannerGoButton
								ariaLabel={t('default:routes.RoutePlanner.results.start_route_aria_label')}
								onClick={() => routePlannerContext.actions.startItinerary(routePlannerContext.data.selected_itinerary_index ?? 0)}
								size="md"
							/>
						)}
					</>
				)}
			</div>

			<ol className={styles.timeline}>
				{legs.map((leg, index) => {
					const waitingStep = waitingByLegIndex.get(index);
					const showOrigin = !isMotisWalkingLeg(leg) || !isSameRoutePlannerPlace(legs[index - 1]?.to, leg.from);
					const showDestination = !isMotisWalkingLeg(leg) || !isSameRoutePlannerPlace(leg.to, legs[index + 1]?.from);
					return (
						<Fragment key={`${getRoutePlannerLegPlaceName(leg.from, routeOriginLabel, routeOriginLabel, routeDestinationLabel)}-${getRoutePlannerLegPlaceName(leg.to, routeDestinationLabel, routeOriginLabel, routeDestinationLabel)}-${index}`}>
							{waitingStep && <RoutePlannerItineraryWaitStep step={waitingStep} />}
							<RoutePlannerItineraryDetailLeg
								alerts={alerts}
								isActive={isNavigating && index === activeLegIndex}
								isFinalDestination={index === legs.length - 1 && !showDestinationStep}
								leg={leg}
								lineByShortName={lineByShortName}
								routeDestinationLabel={routeDestinationLabel}
								routeOriginLabel={routeOriginLabel}
								showDestination={showDestination}
								showOrigin={showOrigin}
							/>
						</Fragment>
					);
				})}
				{showDestinationStep && <RoutePlannerItineraryArrivalStep destination={routeDestinationLabel} time={arrivalTime} />}
			</ol>
		</div>
	);

	//
}
