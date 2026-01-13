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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('plans:plans.list.PlansListHeader.title')}</Label>
			<Spacer />
			<SearchInput onChange={plansListContext.filters.search.set} value={plansListContext.filters.search.value} />
		</Toolbar>
	);

	//
}
