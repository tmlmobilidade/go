'use client';

import { type ValidityStatus, ValidityStatusSchema, ValidityStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Manage the validity-status filter for the plans list.
 */
export function usePlansListFilterValidityStatus(): UseFilterStateListReturnType<ValidityStatus> {
	//

	const selectOptions = useMemo(() =>
		ValidityStatusValues.map(item => ({
			label: item,
			value: item,
		})),
	[]);

	return useFilterStateList(
		'validity_status',
		ValidityStatusSchema.options,
		selectOptions,
	);
}
