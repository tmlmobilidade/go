/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useEventsListFilterAgencies } from './use-events-list-filter-agencies';

/* * */

export function EventsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filterAgencies = useEventsListFilterAgencies();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgencies.isActive}
			label="Operadores"
			onChange={filterAgencies.set}
			options={filterAgencies.options}
			isMultiple
			withToggleAll
		/>
	);
}
