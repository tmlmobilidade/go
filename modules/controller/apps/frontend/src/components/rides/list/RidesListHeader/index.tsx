'use client';

import { RidesListLastUpdatedAt } from '@/components/rides/list/RidesListLastUpdatedAt';
import { Label, SearchInput, Spacer, Toolbar, useFilterStateString } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterSearch = useFilterStateString('search');

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
