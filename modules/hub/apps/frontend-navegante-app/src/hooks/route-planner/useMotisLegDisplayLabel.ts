'use client';

import { type MotisPlanLeg } from '@/types/route-planner/models';
import { getMotisLegDisplayLabel } from '@/utils/route-planner/presentation/modes';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function useMotisLegDisplayLabel() {
	const { t } = useTranslation();

	return useCallback(
		(leg: MotisPlanLeg) => getMotisLegDisplayLabel(
			leg,
			mode => t(`default:routes.RoutePlanner.results.mode_labels.${mode}`),
		),
		[t],
	);
}
