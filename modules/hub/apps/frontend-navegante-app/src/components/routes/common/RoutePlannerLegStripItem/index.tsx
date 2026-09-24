'use client';

import { RoutePlannerLinePill } from '@/components/routes/common/RoutePlannerLinePill';
import { RoutePlannerModeBadge } from '@/components/routes/common/RoutePlannerModeBadge';
import { getDurationMinutes } from '@/utils/route-planner/presentation/format';
import { getRoutePlannerTransitLegLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { IconWalk } from '@tabler/icons-react';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLegStripItemProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubV1ApiLine>
	showConnector: boolean
}

/* * */

export function RoutePlannerLegStripItem({ leg, lineByShortName, showConnector }: RoutePlannerLegStripItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const durationMinutes = getDurationMinutes(leg.duration);
	const isWalkingLeg = isMotisWalkingLeg(leg);
	const accessibleLabel = isWalkingLeg
		? durationMinutes === null
			? t('default:routes.RoutePlanner.results.walk_label')
			: t('default:routes.RoutePlanner.results.walking_time', '', { count: durationMinutes })
		: getRoutePlannerTransitLegLabel(leg, mode => t(`default:routes.RoutePlanner.results.mode_labels.${mode}`));

	//
	// C. Render components

	return (
		<div className={styles.stripItem}>
			<span className={styles.visuallyHidden}>{accessibleLabel}</span>
			<div aria-hidden="true" className={styles.visual}>
				{isWalkingLeg ? (
					<div className={styles.walkPill}>
						<IconWalk size={15} />
						{durationMinutes ? `${durationMinutes}'` : null}
					</div>
				) : (
					<>
						<RoutePlannerModeBadge leg={leg} size="sm" />
						<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} />
					</>
				)}
				{showConnector && <span className={styles.connector}>•••</span>}
			</div>
		</div>
	);

	//
}
