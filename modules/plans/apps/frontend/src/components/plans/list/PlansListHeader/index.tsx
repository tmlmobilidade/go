/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.list' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={plansListContext.actions.setFilterSearch} value={plansListContext.filters.search} />
		</Toolbar>
	);

	//
}
