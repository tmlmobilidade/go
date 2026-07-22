'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { useLinesByShortName } from '@/hooks/useLinesByShortName';
import { formatMotisPlanDurationMinutes, getMotisLegDurationSeconds, getMotisLegMode, getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg, type MotisItinerary, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconWalk } from '@tabler/icons-react';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryLegStripProps {
	itinerary: MotisItinerary
}

/* * */

export function RoutePlannerItineraryLegStrip({ itinerary }: RoutePlannerItineraryLegStripProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineByShortName = useLinesByShortName();

	//
	// B. Transform data

	const legs = useMemo(() => {
		return Array.isArray(itinerary.legs) ? itinerary.legs : [];
	}, [itinerary.legs]);

	//
	// C. Render components

	return (
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
