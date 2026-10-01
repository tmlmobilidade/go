'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseUsersDetailUserIdReturnType {
	userId: string
}

/* * */

export function useUsersDetailUserId(): UseUsersDetailUserIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ userId: string }>();

	const userId = decodeURIComponent(params.userId);

	//
	// B. Return data

	return useMemo(() => ({
		userId,
	}), [userId]);
}
