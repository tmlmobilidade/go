'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseZonesDetailZoneIdReturnType {
	zoneId: string
}

/* * */

export function useZonesDetailZoneId(): UseZonesDetailZoneIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const zoneId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		zoneId,
	}), [zoneId]);
}
