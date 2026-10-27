'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UsePatternsDetailPatternIdReturnType {
	lineId: string
	patternId: string
}

/* * */

export function usePatternsDetailPatternId(): UsePatternsDetailPatternIdReturnType {
	const params = useParams<{ id?: string, patternId?: string }>();
	const lineId = params.id ? decodeURIComponent(params.id) : '';
	const patternId = params.patternId ? decodeURIComponent(params.patternId) : '';

	return useMemo(() => ({ lineId, patternId }), [lineId, patternId]);
}
