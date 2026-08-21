/* * */

import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AgenciesListFilterSearch } from '../AgenciesListFilterSearch';
import { useAgenciesListData } from '../use-agencies-list-data';

/* * */

export function AgenciesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useAgenciesListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:agencies.list.Header.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<AgenciesListFilterSearch />
		</Toolbar>
	);
}
