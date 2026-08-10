'use client';

import { type DelayStatus, DelayStatusSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the delay status filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterDelayStatus(): UseFilterStateListReturnType<DelayStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		DelayStatusSchema.options.map(item => ({
			label: t(`shared:status.delay_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'delay_status',
		DelayStatusSchema.options,
		selectOptions,
	);
}
