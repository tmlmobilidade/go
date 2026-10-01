'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseRolesDetailRoleIdReturnType {
	roleId: string
}

/* * */

export function useRolesDetailRoleId(): UseRolesDetailRoleIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ roleId: string }>();

	const roleId = decodeURIComponent(params.roleId);

	//
	// B. Return data

	return useMemo(() => ({
		roleId,
	}), [roleId]);
}
