'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseRidesDetailRideIdReturnType {
	rideId: string
}

/* * */

export function useRidesDetailRideId(): UseRidesDetailRideIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ rideId: string }>();

	const rideId = params.rideId;

	//
	// B. Return data

	return useMemo(() => ({
		rideId,
	}), [rideId]);
}
