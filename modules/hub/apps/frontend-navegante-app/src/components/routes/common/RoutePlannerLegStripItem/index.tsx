'use client';

import { RoutePlannerLinePill } from '@/components/routes/common/RoutePlannerLinePill';
import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { formatMotisPlanDurationMinutes, getMotisLegDurationSeconds, getMotisLegModeKind, isMotisWalkingLeg, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconWalk } from '@tabler/icons-react';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLegStripItemProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	showConnector: boolean
}

/* * */

export function RoutePlannerLegStripItem({ leg, lineByShortName, showConnector }: RoutePlannerLegStripItemProps) {
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
