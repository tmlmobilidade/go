'use client';

import { GradeStatusSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the analysis expected apex validation interval filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAnalysisExpectedApexValidationInterval(): UseFilterStateListReturnType {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		GradeStatusSchema.options.map(item => ({
			label: t(`shared:status.grade_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'analysis_expected_apex_validation_interval',
		GradeStatusSchema.options,
		selectOptions,
	);
}
