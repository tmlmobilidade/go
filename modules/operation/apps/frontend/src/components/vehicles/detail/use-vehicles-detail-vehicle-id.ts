'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseVehiclesDetailVehicleIdReturnType {
	vehicleId: string
}

/* * */

/**
 * Reads the vehicle ID from the current route params.
 */
export function useVehiclesDetailVehicleId(): UseVehiclesDetailVehicleIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id: string }>();
	const vehicleId = decodeURIComponent(params.id ?? '');

	//
	// B. Return data

	return useMemo(() => ({
		vehicleId,
	}), [vehicleId]);
}
