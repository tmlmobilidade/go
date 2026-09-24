'use client';

import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { getMotisLegModeKind } from '@/utils/route-planner/presentation/modes';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerModeBadgeProps {
	labelled?: boolean
	leg: MotisPlanLeg
	marker?: ReactNode
	size: 'md' | 'sm'
}

/* * */

export function RoutePlannerModeBadge({ labelled = true, leg, marker, size }: RoutePlannerModeBadgeProps) {
	const { t } = useTranslation();
	const modeKind = getMotisLegModeKind(leg);

	return (
		<span className={styles.badge} data-mode={modeKind} data-size={size}>
			{labelled && <span className={styles.visuallyHidden}>{t(`default:routes.RoutePlanner.results.mode_labels.${modeKind}`)}</span>}
			<RoutePlannerModeIcon leg={leg} size={size === 'md' ? 18 : 16} />
			{marker}
		</span>
	);
}
