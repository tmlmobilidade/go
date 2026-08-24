'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UsePlansDetailPlanIdReturnType {
	planId: string
}

/* * */

export function usePlansDetailPlanId(): UsePlansDetailPlanIdReturnType {
	const params = useParams<{ id: string }>();
	const planId = decodeURIComponent(params.id);

	return useMemo(() => ({
		planId,
	}), [planId]);
}
