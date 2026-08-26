'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { usePlansAgencies } from '../../../shared/use-plans-agencies';
/**
 * Manage the agency filter for the plans list.
 */
export function usePlansListFilterAgency(): UseFilterStateListReturnType {
	//

	const { ids, options } = usePlansAgencies({
		permissions: {
			actions: [PermissionCatalog.all.plans.actions.read],
			scope: PermissionCatalog.all.plans.scope,
		},
	});

	return useFilterStateList('agency', ids, options);
}
