'use client';

import { AnnotationCategoryValues } from '@tmlmobilidade/go-types-dates';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export const ANNOTATIONS_WITHOUT_CATEGORY = '__uncategorized__';

/** Category URL filter, including existing annotations without a category. */
export function useAnnotationsListFilterCategories(): UseFilterStateListReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	//
	// B. Transform data

	const options = [
		{ label: t('annotations:categories.uncategorized'), value: ANNOTATIONS_WITHOUT_CATEGORY },
		...AnnotationCategoryValues.map(value => ({ label: t(`annotations:categories.values.${value}`), value })),
	];
	//
	// C. Return state

	return useFilterStateList('category', options.map(option => option.value), options);
}
