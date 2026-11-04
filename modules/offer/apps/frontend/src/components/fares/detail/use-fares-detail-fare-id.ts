'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseFaresDetailFareIdReturnType {
	fareId: string
}

/* * */

export function useFaresDetailFareId(): UseFaresDetailFareIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const fareId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		fareId,
	}), [fareId]);
}
