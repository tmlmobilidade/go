'use client';

import { type RideAcceptanceStatusFilter, RideAcceptanceStatusFilterValues } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the acceptance status filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAcceptanceStatus(): UseFilterStateListReturnType<RideAcceptanceStatusFilter> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		RideAcceptanceStatusFilterValues.map(item => ({
			label: t(`ride_status:acceptance_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'acceptance_status',
		[...RideAcceptanceStatusFilterValues],
		selectOptions,
	);
}
