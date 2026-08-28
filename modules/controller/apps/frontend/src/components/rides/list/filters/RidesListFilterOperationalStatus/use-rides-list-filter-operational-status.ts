'use client';

import { type OperationalStatus, OperationalStatusSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the operational status filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterOperationalStatus(): UseFilterStateListReturnType<OperationalStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		OperationalStatusSchema.options.map(item => ({
			label: t(`shared:status.operational_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'operational_status',
		OperationalStatusSchema.options,
		selectOptions,
	);
}
