/* * */

import { PlansListFilterSearch } from '@/components/plans/list/filters/PlansListFilterSearch';
import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';

import { PlansListHeaderMenu } from '../PlansListHeaderMenu';
import { usePlansListData } from '../use-plans-list-data';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const { data, isLoading, isValidating, timestamp } = usePlansListData();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<PlansListHeaderMenu />}
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<PlansListFilterSearch />}
			title="Planos"
		/>
	);
}
