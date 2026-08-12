'use client';

import { type GradeStatusFilter, GradeStatusFilterSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the analysis at least one vehicle event on last stop filter for the rides list filter bar.
 * @returns The filter state management object.
 */
export function useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop(): UseFilterStateListReturnType<GradeStatusFilter> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		GradeStatusFilterSchema.options.map(item => ({
			label: t(`shared:status.grade_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'analysis_at_least_one_vehicle_event_on_last_stop',
		GradeStatusFilterSchema.options,
		selectOptions,
	);
}
