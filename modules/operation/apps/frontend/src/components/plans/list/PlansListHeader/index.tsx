/* * */

import { PlansListFilterSearch } from '@/components/plans/list/filters/PlansListFilterSearch';
import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { usePlansListData } from '../use-plans-list-data';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = usePlansListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Planos</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<PlansListFilterSearch />
		</Toolbar>
	);
}
