'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseYearPeriodsDetailYearPeriodIdReturnType {
	yearPeriodId: string
}

/* * */

export function useYearPeriodsDetailYearPeriodId(): UseYearPeriodsDetailYearPeriodIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const yearPeriodId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		yearPeriodId,
	}), [yearPeriodId]);
}
