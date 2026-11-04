'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useMotisLegDisplayLabel } from '@/hooks/route-planner/useMotisLegDisplayLabel';
import { getMotisLegModeKind, getMotisLegRouteLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerLinePillProps {
	leg: MotisPlanLeg
	openLineDetails?: boolean
	size?: 'lg' | 'md' | 'sm'
}

/* * */

export function RoutePlannerLinePill({ leg, openLineDetails = false, size = 'sm' }: RoutePlannerLinePillProps) {
	//

	//
	// A. Setup variables

	const { linesByShortName } = useLinesData();
	const getLegDisplayLabel = useMotisLegDisplayLabel();
	const { push } = useBottomSheet();
	const { t } = useTranslation();

	//
	// B. Transform data

	const routeLabel = getMotisLegRouteLabel(leg);
	const label = getLegDisplayLabel(leg);
	const modeKind = getMotisLegModeKind(leg);
	const lineData = linesByShortName.get(routeLabel);

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
