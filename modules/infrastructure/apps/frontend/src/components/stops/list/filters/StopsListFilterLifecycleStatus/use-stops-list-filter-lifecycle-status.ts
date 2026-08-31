'use client';

import { type LifecycleStatus, LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the validity-status filter for the plans list.
 * @returns The filter state management object.
 */
export function useStopsListFilterLifecycleStatus(): UseFilterStateListReturnType<LifecycleStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		LifecycleStatusValues.map(item => ({
			label: t(`shared:status.lifecycle_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'lifecycle_status',
		[...LifecycleStatusValues],
		selectOptions,
	);
}
