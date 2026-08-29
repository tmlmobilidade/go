'use client';

import { type AlertEffect, AlertEffectSchema } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the reference type filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterEffect(): UseFilterStateListReturnType<AlertEffect> {
	//

	const { t } = useTranslation();

	const options = AlertEffectSchema.options;

	const selectOptions = useMemo(() =>
		options.map(item => ({
			label: t(`effects:${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'effect',
		AlertEffectSchema.options,
		selectOptions,
	);
}
