'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLegBadgeProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
}

/* * */

export function RoutePlannerLegBadge({ leg, lineByShortName }: RoutePlannerLegBadgeProps) {
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
