/* * */

import { PlansListFilterSearch } from '@/components/plans/list/filters/PlansListFilterSearch';
import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';

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
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<PlansListFilterSearch />}
			title="Planos"
		/>
	);
}
