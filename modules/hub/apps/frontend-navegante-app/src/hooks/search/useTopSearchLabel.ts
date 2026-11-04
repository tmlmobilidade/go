'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useMemo } from 'react';

/* * */

export function useTopSearchLabel(): null | string {
	//

	//
	// A. Setup variables

	const { activeBottomSheet } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	return useMemo(() => {
		if (activeBottomSheet?.view === 'routes' && routePlannerContext.data.view_mode === 'place-detail') {
			return routePlannerContext.data.destination?.label ?? null;
		}

		return null;
	}, [activeBottomSheet, routePlannerContext.data.destination?.label, routePlannerContext.data.view_mode]);

	//
}
