'use client';

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsListFilterSearch } from '../filters/StopsListFilterSearch';
import { StopsListHeaderMenu } from '../StopsListHeaderMenu';
import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useStopsListData();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<StopsListHeaderMenu />}
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<StopsListFilterSearch />}
			title={t('default:stops.list.Header.title')}
		/>
	);
}
