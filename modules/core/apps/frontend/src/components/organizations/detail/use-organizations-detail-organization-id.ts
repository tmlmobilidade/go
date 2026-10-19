'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseOrganizationsDetailOrganizationIdReturnType {
	organizationId: string
}

/* * */

export function useOrganizationsDetailOrganizationId(): UseOrganizationsDetailOrganizationIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ organizationId: string }>();

	const organizationId = decodeURIComponent(params.organizationId);

	//
	// B. Return data

	return useMemo(() => ({
		organizationId,
	}), [organizationId]);
}
