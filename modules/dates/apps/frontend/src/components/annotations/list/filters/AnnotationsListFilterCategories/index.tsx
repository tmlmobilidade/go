'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListFilterCategories } from './use-annotations-list-filter-categories';

/* * */

export function AnnotationsListFilterCategories() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const category = useAnnotationsListFilterCategories();

	//
	// B. Render components

	return (
		<ListFilter
			active={category.isActive}
			label={t('annotations:list.AnnotationsListFilterCategories.label')}
			onChange={category.set}
			options={category.options}
			isMultiple
			withToggleAll
		/>
	);
}
