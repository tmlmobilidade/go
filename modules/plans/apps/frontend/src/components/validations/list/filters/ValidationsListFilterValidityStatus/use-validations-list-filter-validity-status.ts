'use client';

import { ValidityStatusSchema, ValidityStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Manage the validity-status filter for the validations list.
 * @returns The filter state management object.
 */
export function useValidationsListFilterValidityStatus(): UseFilterStateListReturnType {
	//

	const selectOptions = useMemo(() =>
		ValidityStatusValues.map(item => ({
			label: item,
			value: item,
		})),
	[]);

	//

	return useFilterStateList(
		'validity_status',
		ValidityStatusSchema.options,
		selectOptions,
	);
}
