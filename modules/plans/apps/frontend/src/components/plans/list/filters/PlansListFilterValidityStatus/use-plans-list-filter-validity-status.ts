'use client';

import { planValidityStatusOptions, planValidityStatusValues } from '@/types/normalized';
import { type PlanValidityStatus } from '@tmlmobilidade/go-plans-pckg-types';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Hook to manage the validity-status filter for the plans list.
 * @returns The filter state management object.
 */
export function usePlansListFilterValidityStatus(): UseFilterStateListReturnType<PlanValidityStatus> {
	return useFilterStateList('validity_status', planValidityStatusValues, planValidityStatusOptions);
}
