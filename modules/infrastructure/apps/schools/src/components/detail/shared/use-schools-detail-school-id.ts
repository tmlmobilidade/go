'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseSchoolsDetailSchoolIdReturnType {
	schoolId: string | undefined
}

/* * */

export function useSchoolsDetailSchoolId(): UseSchoolsDetailSchoolIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ schoolId?: string }>();

	const schoolId = params.schoolId ? decodeURIComponent(params.schoolId) : undefined;

	//
	// B. Return data

	return useMemo(() => ({
		schoolId,
	}), [schoolId]);
}
