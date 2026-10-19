'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseAgenciesDetailAgencyIdReturnType {
	agencyId: string
}

/* * */

export function useAgenciesDetailAgencyId(): UseAgenciesDetailAgencyIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ agencyId: string }>();

	const agencyId = decodeURIComponent(params.agencyId);

	//
	// B. Return data

	return useMemo(() => ({
		agencyId,
	}), [agencyId]);
}
