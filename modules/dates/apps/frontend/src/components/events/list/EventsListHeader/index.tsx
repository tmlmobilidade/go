/* * */

import { openCreateEventModal } from '@/components/events/create/EventCreate.modal';
import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function EventsListHeader() {
	//

	//
	// A. Setup variables

	const eventsListContext = useEventsListContext();

	//
	// B. Render components

	return (
		<ListHeader
			count={eventsListContext.data.filtered.length}
			search={<SearchField onChange={eventsListContext.filters.search.set} value={eventsListContext.filters.search.value} />}
			title="Eventos"
			actions={(
				<HasPermission action={PermissionCatalog.all.events.actions.create} scope={PermissionCatalog.all.events.scope}>
					<Button label="Novo Evento" leftSection={<IconPlus />} onClick={openCreateEventModal} />
				</HasPermission>
			)}
		/>
	);

	//
}
