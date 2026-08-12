'use client';

import { type DelayStatusFilter, DelayStatusFilterSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the end delay status filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterEndDelayStatus(): UseFilterStateListReturnType<DelayStatusFilter> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		DelayStatusFilterSchema.options.map(item => ({
			label: t(`shared:status.delay_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'end_delay_status',
		DelayStatusFilterSchema.options,
		selectOptions,
	);
}
