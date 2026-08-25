'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UsePlansDetailPlanIdReturnType {
	planId: string
}

/* * */

export function usePlansDetailPlanId(): UsePlansDetailPlanIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id: string }>();
	const planId = decodeURIComponent(params.id);

	//
	// B. Return data

	return useMemo(() => ({
		planId,
	}), [planId]);
}
