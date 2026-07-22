'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { type MotisPlanLeg } from '@/types/route-planner/models';
import { getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg } from '@/utils/route-planner/modes';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLinePillProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	size?: 'md' | 'sm'
}

/* * */

export function RoutePlannerLinePill({ leg, lineByShortName, size = 'sm' }: RoutePlannerLinePillProps) {
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
		return <LineBadge lineData={lineData} size={size} />;
	}

	return (
		<span className={styles.linePill} data-mode={modeKind} data-size={size}>
			{label}
		</span>
	);

	//
}
