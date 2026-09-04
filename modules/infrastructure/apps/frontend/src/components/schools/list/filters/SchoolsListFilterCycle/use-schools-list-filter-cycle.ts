'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const cycleOptions = ['pre_school', 'basic_1', 'basic_2', 'basic_3', 'high_school', 'professional', 'special', 'artistic', 'university', 'other'] as const;
type SchoolCycle = typeof cycleOptions[number];

/* * */

export function useSchoolsListFilterCycle(): UseFilterStateListReturnType<SchoolCycle> {
	const { t } = useTranslation();

	const options = useMemo(() => cycleOptions.map(item => ({
		label: t(`schools:list.filters.cycle.options.${item}`),
		value: item,
	})), [t]);

	return useFilterStateList('cycles', [...cycleOptions], options);
}
