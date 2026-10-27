'use client';

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { RidesListFilterSearch } from '../filters/RidesListFilterSearch';
import { RidesListHeaderMenu } from '../RidesListHeaderMenu';
import { useRidesListData } from '../use-rides-list-data';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useRidesListData();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<RidesListHeaderMenu />}
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<RidesListFilterSearch />}
			title={t('default:list.RidesListHeader.title')}
		/>
	);
}
