/* * */

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AgenciesListFilterSearch } from '../AgenciesListFilterSearch';
import { useAgenciesListData } from '../use-agencies-list-data';

/* * */

export function AgenciesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useAgenciesListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<AgenciesListFilterSearch />}
			title={t('default:agencies.list.Header.title')}
		/>
	);
}
