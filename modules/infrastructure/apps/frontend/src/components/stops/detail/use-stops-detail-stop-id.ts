'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseStopsDetailStopIdReturnType {
	stopId: string
}

/* * */

export function useStopsDetailStopId(): UseStopsDetailStopIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ stopId: string }>();

	const stopId = decodeURIComponent(params.stopId);

	//
	// B. Return data

	return useMemo(() => ({
		stopId,
	}), [stopId]);
}
