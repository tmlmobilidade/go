'use client';

import { type AlertReferenceType, AlertReferenceTypeValues } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the reference type filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterReferenceType(): UseFilterStateListReturnType<AlertReferenceType> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		AlertReferenceTypeValues.map(item => ({
			label: t(`reference_types:${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'reference_type',
		[...AlertReferenceTypeValues],
		selectOptions,
	);
}
