'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseValidationsDetailValidationIdReturnType {
	validationId: string
}

/* * */

export function useValidationsDetailValidationId(): UseValidationsDetailValidationIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id: string }>();
	const validationId = decodeURIComponent(params.id);

	//
	// B. Return data

	return useMemo(() => ({
		validationId,
	}), [validationId]);
}
