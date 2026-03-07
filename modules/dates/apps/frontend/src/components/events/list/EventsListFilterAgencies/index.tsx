/* * */

import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function EventsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const eventsListContext = useEventsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={eventsListContext.filters.agency.isActive}
			label="Operadores"
			onChange={eventsListContext.filters.agency.set}
			options={eventsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
