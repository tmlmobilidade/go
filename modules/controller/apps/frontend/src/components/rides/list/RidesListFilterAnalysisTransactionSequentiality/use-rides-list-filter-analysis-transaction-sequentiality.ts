'use client';

import { type GradeStatus, GradeStatusSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the analysis transaction sequentiality filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAnalysisTransactionSequentiality(): UseFilterStateListReturnType<GradeStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		GradeStatusSchema.options.map(item => ({
			label: t(`shared:status.grade_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'analysis_transaction_sequentiality',
		GradeStatusSchema.options,
		selectOptions,
	);
}
