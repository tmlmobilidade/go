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

	const params = useParams<{ ride_id: string }>();

	const rideId = decodeURIComponent(params.ride_id);

	//
	// B. Return data

	return useMemo(() => ({
		rideId,
	}), [rideId]);
}
