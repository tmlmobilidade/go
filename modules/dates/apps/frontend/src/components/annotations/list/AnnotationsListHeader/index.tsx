'use client';

/* * */

import { ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListFilterSearch } from '../AnnotationsListFilterSearch/use-annotations-list-filter-search';
import { AnnotationsListHeaderMenu } from '../AnnotationsListHeaderMenu';
import { useAnnotationsListData } from '../use-annotations-list-data';

/* * */

export function AnnotationsListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useAnnotationsListData();
	const search = useAnnotationsListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<AnnotationsListHeaderMenu />}
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:annotations.list.title')}
		/>
	);
}
