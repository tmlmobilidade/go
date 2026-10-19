/* * */

import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function EventsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const eventsListContext = useEventsListContext();

	//
	// B. Render components

	return (
		<ListFilter
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
