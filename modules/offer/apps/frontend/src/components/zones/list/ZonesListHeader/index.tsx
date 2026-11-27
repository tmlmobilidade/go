'use client';

/* * */

import { ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesListFilterSearch } from '../filters/ZonesListFilterSearch/use-zones-list-filter-search';
import { useZonesListData } from '../use-zones-list-data';
import { ZonesListHeaderMenu } from '../ZoneslistHeaderMenu';

/* * */

export function ZonesListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useZonesListData();
	const search = useZonesListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:zones.list.title')}
			actions={(
				<ZonesListHeaderMenu />
			)}
		/>
	);
}
