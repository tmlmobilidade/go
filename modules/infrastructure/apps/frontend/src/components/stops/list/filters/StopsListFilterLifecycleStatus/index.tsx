/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useStopsListFilterLifecycleStatus } from './use-stops-list-filter-lifecycle-status';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterLifecycleStatus.isActive}
			label="Estado"
			onChange={filterLifecycleStatus.set}
			options={filterLifecycleStatus.options}
			withToggleAll
		/>
	);
}
