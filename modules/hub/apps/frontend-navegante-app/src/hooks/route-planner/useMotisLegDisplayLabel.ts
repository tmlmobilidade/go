'use client';

import { getMotisLegDisplayLabel } from '@/utils/route-planner/presentation/modes';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
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
