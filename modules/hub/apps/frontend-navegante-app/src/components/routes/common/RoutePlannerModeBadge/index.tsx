'use client';

import { RoutePlannerModeIcon } from '@/components/routes/common/RoutePlannerModeIcon';
import { getMotisLegModeKind, type MotisPlanLeg } from '@/utils/route-planner-motis';
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
