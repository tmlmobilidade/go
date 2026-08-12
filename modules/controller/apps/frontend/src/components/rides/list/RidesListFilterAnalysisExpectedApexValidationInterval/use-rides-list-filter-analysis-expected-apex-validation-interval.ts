'use client';

import { type GradeStatusFilter, GradeStatusFilterSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the analysis expected apex validation interval filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAnalysisExpectedApexValidationInterval(): UseFilterStateListReturnType<GradeStatusFilter> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		GradeStatusFilterSchema.options.map(item => ({
			label: t(`shared:status.grade_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'analysis_expected_apex_validation_interval',
		GradeStatusFilterSchema.options,
		selectOptions,
	);
}
