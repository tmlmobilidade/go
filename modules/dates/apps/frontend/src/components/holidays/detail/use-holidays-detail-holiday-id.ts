'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseHolidaysDetailHolidayIdReturnType {
	holidayId: string
}

/* * */

export function useHolidaysDetailHolidayId(): UseHolidaysDetailHolidayIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const holidayId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		holidayId,
	}), [holidayId]);
}
