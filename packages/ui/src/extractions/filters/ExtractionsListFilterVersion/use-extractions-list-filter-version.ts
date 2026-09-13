'use client';

import { ExtractionVersionValues } from '@tmlmobilidade/go-types-extractions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the organization IDs filter for the users list filter bar.
 * @returns The filter state management object.
 */
export function useExtractionsListFilterVersion(): UseFilterStateListReturnType {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		ExtractionVersionValues.map(item => ({
			label: t(`shared:extractions.versions.${item}.title`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'version',
		[...ExtractionVersionValues],
		selectOptions,
	);
}
