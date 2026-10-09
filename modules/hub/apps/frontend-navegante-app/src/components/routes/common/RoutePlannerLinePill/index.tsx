'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useMotisLegDisplayLabel } from '@/hooks/route-planner/useMotisLegDisplayLabel';
import { getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLinePillProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubV1ApiLine>
	openLineDetails?: boolean
	size?: 'lg' | 'md' | 'sm'
}

/* * */

export function RoutePlannerLinePill({ leg, lineByShortName, openLineDetails = false, size = 'sm' }: RoutePlannerLinePillProps) {
	//

	//
	// A. Setup variables

	const getLegDisplayLabel = useMotisLegDisplayLabel();
	const { push } = useBottomSheet();
	const { t } = useTranslation();

	//
	// B. Transform data

	const routeLabel = getMotisLegRouteLabel(leg);
	const label = getLegDisplayLabel(leg);
	const modeKind = getMotisLegModeKind(leg);
	const lineData = lineByShortName.get(routeLabel);

	//
	// C. Render components

	if (!isMotisWalkingLeg(leg) && lineData) {
		return <LineBadge ariaLabel={openLineDetails ? t('default:lines.LineBadge.open_details', '', { line: lineData.short_name }) : undefined} lineData={lineData} onClick={openLineDetails ? () => push({ entityId: lineData._id, view: 'lines-detail' }) : undefined} size={size} />;
	}

	return (
		<span className={styles.linePill} data-mode={modeKind} data-size={size}>
			{label}
		</span>
	);

	//
}
