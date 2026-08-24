'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseValidationsDetailValidationIdReturnType {
	validationId: string
}

/* * */

export function useValidationsDetailValidationId(): UseValidationsDetailValidationIdReturnType {
	const params = useParams<{ id: string }>();
	const validationId = decodeURIComponent(params.id);

	return useMemo(() => ({
		validationId,
	}), [validationId]);
}
