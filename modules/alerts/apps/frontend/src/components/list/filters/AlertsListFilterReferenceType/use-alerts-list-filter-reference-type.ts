'use client';

import { type AlertReferenceType, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
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

	const options = AlertReferenceTypeSchema.options;

	const selectOptions = useMemo(() =>
		options.map(item => ({
			label: t(`reference_types:${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'reference_type',
		AlertReferenceTypeSchema.options,
		selectOptions,
	);
}
