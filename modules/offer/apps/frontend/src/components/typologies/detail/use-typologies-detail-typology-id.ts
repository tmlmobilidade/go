'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseTypologiesDetailTypologyIdReturnType {
	typologyId: string
}

/* * */

export function useTypologiesDetailTypologyId(): UseTypologiesDetailTypologyIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const typologyId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		typologyId,
	}), [typologyId]);
}
