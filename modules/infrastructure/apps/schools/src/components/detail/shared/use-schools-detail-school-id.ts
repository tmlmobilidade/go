'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseSchoolsDetailSchoolIdReturnType {
	schoolId: string
}

/* * */

export function useSchoolsDetailSchoolId(): UseSchoolsDetailSchoolIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ schoolId: string }>();

	const schoolId = decodeURIComponent(params.schoolId);

	//
	// B. Return data

	return useMemo(() => ({
		schoolId,
	}), [schoolId]);
}
