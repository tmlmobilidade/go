'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useLinesByShortName } from '@/hooks/route-planner/useLinesByShortName';
import { useRoutePlannerActiveLeg } from '@/hooks/route-planner/useRoutePlannerActiveLeg';
import { formatMotisPlanDistance, formatMotisPlanTime } from '@/utils/route-planner/format';
import { getMotisLegRouteLabel, isMotisWalkingLeg } from '@/utils/route-planner/modes';
import { IconWalk } from '@tabler/icons-react';
import { type MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerLiveBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { activeBottomSheet } = useBottomSheet();
	const lineByShortName = useLinesByShortName();
	const routePlannerContext = useRoutePlannerContext();
	const { activeLeg, activeLegIndex, remainingDistanceMeters, remainingMinutes } = useRoutePlannerActiveLeg();

	//
	// B. Transform data

	const isNavigating = routePlannerContext.flags.is_navigating;
	const itinerary = routePlannerContext.data.selected_itinerary;
	const isDetailSheetOpen = activeBottomSheet?.view === 'routes' && routePlannerContext.data.view_mode === 'itinerary-detail';
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const nextLeg = legs[activeLegIndex + 1] ?? null;

	const nextStepLabel = useMemo(() => {
		if (!activeLeg) return t('default:routes.RoutePlanner.results.route_summary');

		if (isMotisWalkingLeg(activeLeg)) {
			const destination = activeLeg.to?.name && activeLeg.to.name !== 'END'
				? activeLeg.to.name
				: routePlannerContext.data.destination?.label ?? t('default:routes.RoutePlanner.results.destination');
			return t('default:routes.RoutePlanner.results.walk_between', '', { to: destination });
		}

		const routeLabel = getMotisLegRouteLabel(activeLeg);
		const lineData = lineByShortName.get(routeLabel);
		return activeLeg.headsign || lineData?.short_name || routeLabel || t('default:routes.RoutePlanner.results.route_summary');
	}, [activeLeg, lineByShortName, routePlannerContext.data.destination?.label, t]);

	const activeStepDetail = useMemo(() => {
		const details: string[] = [];

		if (remainingMinutes !== null) {
			details.push(t('default:routes.RoutePlanner.results.leg_duration', '', { count: remainingMinutes }));
		}

		if (activeLeg && isMotisWalkingLeg(activeLeg)) {
			const distance = formatMotisPlanDistance(remainingDistanceMeters ?? undefined);
			if (distance) details.push(distance);
		}

		return details.join(' · ');
	}, [activeLeg, remainingDistanceMeters, remainingMinutes, t]);

	const activeStepLine = useMemo(() => {
		if (!activeLeg || isMotisWalkingLeg(activeLeg)) return null;
		const routeLabel = getMotisLegRouteLabel(activeLeg);
		return lineByShortName.get(routeLabel) ?? null;
	}, [activeLeg, lineByShortName]);

	const nextStepLine = useMemo(() => {
		if (!nextLeg || isMotisWalkingLeg(nextLeg)) return null;
		return lineByShortName.get(getMotisLegRouteLabel(nextLeg)) ?? null;
	}, [lineByShortName, nextLeg]);

	const nextStepRouteLabel = nextLeg && !isMotisWalkingLeg(nextLeg) ? getMotisLegRouteLabel(nextLeg) : null;
	const nextStepTime = nextLeg ? formatMotisPlanTime(nextLeg.startTime) : null;
	const nextWalkingStepLabel = nextLeg && isMotisWalkingLeg(nextLeg) && nextStepTime
		? t('default:routes.RoutePlanner.results.next_step_at', '', {
			step: t('default:routes.RoutePlanner.results.walk_label'),
			time: nextStepTime,
		})
		: null;

	//
	// C. Handle actions

	const handleOpenDetail = () => {
		routePlannerContext.actions.openActiveTripDetail();
	};

	const handleEndTrip = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		routePlannerContext.actions.endActiveTrip();
	};

	//
	// D. Render components

	if (!isNavigating || !itinerary || isDetailSheetOpen) return null;

	return (
		<div className={styles.container}>
			<button className={styles.main} onClick={handleOpenDetail} type="button">
				<div className={styles.lead}>
					{activeLeg && isMotisWalkingLeg(activeLeg) ? (
						<span className={styles.walkIcon}>
							<IconWalk size={18} />
						</span>
					) : activeStepLine ? (
						<LineBadge lineData={activeStepLine} size="sm" />
					) : null}
					<div className={styles.copy}>
						<strong>{nextStepLabel}</strong>
						{(activeStepDetail || nextLeg) && (
							<div className={styles.details}>
								{activeStepDetail && <span>{activeStepDetail}</span>}
								{activeStepDetail && nextLeg && <span aria-hidden="true">·</span>}
								{nextStepRouteLabel && (
									<LineBadge
										lineData={nextStepLine ?? undefined}
										shortName={nextStepRouteLabel}
										size="sm"
									/>
								)}
								{nextStepRouteLabel && nextStepTime && (
									<span>{t('default:routes.RoutePlanner.results.at_time', '', { time: nextStepTime })}</span>
								)}
								{nextWalkingStepLabel && (
									<span>{nextWalkingStepLabel}</span>
								)}
							</div>
						)}
					</div>
				</div>
			</button>

			<button className={styles.endButton} onClick={handleEndTrip} type="button">
				{t('default:routes.RoutePlanner.results.end_trip')}
			</button>
		</div>
	);

	//
}
