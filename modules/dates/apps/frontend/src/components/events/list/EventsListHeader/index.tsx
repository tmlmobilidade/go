'use client';

import { openEventsCreateModal } from '@/components/events/create/EventsCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { EventsListFilterSearch } from '../filters/EventsListFilterSearch';
import { useEventsListData } from '../use-events-list-data';

/* * */

export function EventsListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useEventsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Eventos</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<EventsListFilterSearch />
			<HasPermission action={PermissionCatalog.all.events.actions.create} scope={PermissionCatalog.all.events.scope}>
				<Button
					icon={<IconPlus size={20} />}
					label="Novo Evento"
					onClick={openEventsCreateModal}
				/>
			</HasPermission>
		</Toolbar>
	);
}
