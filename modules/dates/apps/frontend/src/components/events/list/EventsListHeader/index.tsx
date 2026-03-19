/* * */

import { openCreateEventModal } from '@/components/events/create/EventCreate.modal';
import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function EventsListHeader() {
	//

	//
	// A. Setup variables

	const eventsListContext = useEventsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Eventos</Label>
			<Spacer />
			<SearchInput onChange={eventsListContext.filters.search.set} value={eventsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.events.actions.create} scope={PermissionCatalog.all.events.scope}>
				<Button label="Novo Evento" leftSection={<IconPlus />} onClick={openCreateEventModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
