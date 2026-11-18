'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseChangelogDetailIdReturnType {
	id: string
}

/* * */

export function useChangelogDetailId(): UseChangelogDetailIdReturnType {
	//

	const params = useParams<{ releaseId?: string }>();
	const id = params.releaseId ? decodeURIComponent(params.releaseId) : '';

	return useMemo(() => ({ id }), [id]);
}
