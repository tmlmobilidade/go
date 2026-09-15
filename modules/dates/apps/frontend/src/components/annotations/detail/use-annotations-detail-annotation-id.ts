'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseAnnotationsDetailAnnotationIdReturnType {
	annotationId: string
}

/* * */

export function useAnnotationsDetailAnnotationId(): UseAnnotationsDetailAnnotationIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const annotationId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		annotationId,
	}), [annotationId]);
}
