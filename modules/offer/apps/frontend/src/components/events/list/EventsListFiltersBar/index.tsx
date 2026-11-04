/* * */

import { EventsListFilterAgencies } from '@/components/events/list/EventsListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function EventsListFiltersBar() {
	return (
		<FiltersBar>
			<EventsListFilterAgencies />
		</FiltersBar>
	);
}
