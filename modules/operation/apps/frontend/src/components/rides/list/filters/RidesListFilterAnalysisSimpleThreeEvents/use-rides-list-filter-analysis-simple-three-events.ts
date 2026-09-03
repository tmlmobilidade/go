'use client';

import { type GradeStatusFilter, GradeStatusFilterValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the analysis simple three events filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAnalysisSimpleThreeEvents(): UseFilterStateListReturnType<GradeStatusFilter> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		GradeStatusFilterValues.map(item => ({
			label: t(`shared:status.grade_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'analysis_simple_three_events',
		[...GradeStatusFilterValues],
		selectOptions,
	);
}
