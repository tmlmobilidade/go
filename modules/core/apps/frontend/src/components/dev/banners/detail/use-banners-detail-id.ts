'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseBannersDetailIdReturnType {
	id: string
}

/* * */

export function useBannersDetailId(): UseBannersDetailIdReturnType {
	//

	const params = useParams<{ bannerId?: string }>();
	const id = params.bannerId ? decodeURIComponent(params.bannerId) : '';

	return useMemo(() => ({ id }), [id]);
}
