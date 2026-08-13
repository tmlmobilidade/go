'use client';

import { Label, LoadingActivity, SearchField, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListData } from '../use-rides-list-data';
import { useRidesListFilterSearch } from './use-rides-list-filter-search';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useRidesListData();

	const filterSearch = useRidesListFilterSearch();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('default:list.RidesListHeader.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer shrink />
			<SearchField onChange={filterSearch.set} value={filterSearch.value} />
		</Toolbar>
	);
}
