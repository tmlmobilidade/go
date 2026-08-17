'use client';

import { type AlertCause, AlertCauseSchema } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the reference type filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterCause(): UseFilterStateListReturnType<AlertCause> {
	//

	const { t } = useTranslation();

	const options = AlertCauseSchema.options;

	const selectOptions = useMemo(() =>
		options.map(item => ({
			label: t(`causes:${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'cause',
		AlertCauseSchema.options,
		selectOptions,
	);
}
