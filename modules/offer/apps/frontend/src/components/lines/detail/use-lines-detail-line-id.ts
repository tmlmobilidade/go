'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseLinesDetailLineIdReturnType {
	lineId: string
}

/* * */

export function useLinesDetailLineId(): UseLinesDetailLineIdReturnType {
	//
	// A. Read route parameters

	const params = useParams<{ id?: string }>();
	const lineId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({ lineId }), [lineId]);
}
