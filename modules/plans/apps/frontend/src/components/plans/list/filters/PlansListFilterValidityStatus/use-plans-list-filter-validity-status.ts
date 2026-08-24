'use client';

import { planValidityStatusOptions, planValidityStatusValues } from '@/types/normalized';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

/**
 * Manage the validity-status filter for the plans list.
 */
export function usePlansListFilterValidityStatus(): UseFilterStateListReturnType {
	return useFilterStateList('validity_status', planValidityStatusValues, planValidityStatusOptions);
}
