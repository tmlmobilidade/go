'use client';

import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { type MotisPlanLeg } from '@/types/route-planner/models';
import { getMotisLegModeKind } from '@/utils/route-planner/modes';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerModeBadgeProps {
	leg: MotisPlanLeg
	marker?: ReactNode
	size: 'md' | 'sm'
}

/* * */

export function RoutePlannerModeBadge({ leg, marker, size }: RoutePlannerModeBadgeProps) {
	return (
		<span className={styles.badge} data-mode={getMotisLegModeKind(leg)} data-size={size}>
			<RoutePlannerModeIcon leg={leg} size={size === 'md' ? 18 : 16} />
			{marker}
		</span>
	);
}
