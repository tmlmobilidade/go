'use client';

import { RidesListLastUpdatedAt } from '@/components/rides/list/RidesListLastUpdatedAt';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterSearch } from './use-rides-list-filter-search';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterSearch = useRidesListFilterSearch();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('default:list.RidesListHeader.title')}</Label>
			<RidesListLastUpdatedAt />
			<Spacer shrink />
			<SearchInput onChange={filterSearch.set} value={filterSearch.value} />
		</Toolbar>
	);
}
