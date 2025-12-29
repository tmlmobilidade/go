/* * */

import { useAgenciesListContext } from '@/components/agencies/list/AgenciesList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgenciesListHeader() {
	//

	//
	// A. Setup variables

	const agenciesListContext = useAgenciesListContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={agenciesListContext.actions.setFilterSearch} value={agenciesListContext.filters.search} />
		</Toolbar>
	);

	//
}
