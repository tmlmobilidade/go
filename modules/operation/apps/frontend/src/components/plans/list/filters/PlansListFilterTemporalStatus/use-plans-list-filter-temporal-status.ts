'use client';

import { type TemporalStatus, TemporalStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the validity-status filter for the plans list.
 * @returns The filter state management object.
 */
export function usePlansListFilterTemporalStatus(): UseFilterStateListReturnType<TemporalStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		TemporalStatusValues.map(item => ({
			label: t(`shared:status.temporal_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'temporal_status',
		[...TemporalStatusValues],
		selectOptions,
	);
}
