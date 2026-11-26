'use client';

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { PlansListFilterSearch } from '../filters/PlansListFilterSearch';
import { PlansListHeaderMenu } from '../PlansListHeaderMenu';
import { usePlansListData } from '../use-plans-list-data';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = usePlansListData();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<PlansListHeaderMenu />}
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<PlansListFilterSearch />}
			title={t('default:plans.list.PlansListHeader.title')}
		/>
	);
}
