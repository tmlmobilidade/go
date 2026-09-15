'use client';

import { EventsDetailPatternsMenu } from '@/components/events/detail/EventsDetailPatternsMenu';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useEventsDetailFormContext } from '../EventsDetailForm.context';
import { useEventsDetailData } from '../use-events-detail-data';
import { useEventsDetailEventId } from '../use-events-detail-event-id';

/* * */

export function EventsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { eventId } = useEventsDetailEventId();

	const { data: eventData } = useEventsDetailData();

	const { actions, capabilities, form, status } = useEventsDetailFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={eventId} copyOnClick />
			<Label size="lg" singleLine>{titleValue}</Label>

			<Spacer />

			<EventsDetailPatternsMenu value={eventData?.associated_patterns ?? []} />

			<HasPermission action={PermissionCatalog.all.events.actions.update} scope={PermissionCatalog.all.events.scope}>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.events.actions.lock} scope={PermissionCatalog.all.events.scope}>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked ?? false}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.events.actions.delete} scope={PermissionCatalog.all.events.scope}>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar este evento? Esta ação não pode ser revertida."
					confirmTitle="Apagar Evento"
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
