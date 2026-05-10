'use client';

import { useEventsDetailContext } from '@/components/events/detail/EventsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { EventsDetailPatternsMenu } from '../EventsDetailPatternsMenu';

/* * */

export function EventsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const eventsDetailContext = useEventsDetailContext();

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

			<IdTag id={eventsDetailContext.data.event._id} copyOnClick />

			<Spacer />

			<EventsDetailPatternsMenu patterns={eventsDetailContext.data.event.associated_patterns} />

			<LockButton
				isDisabled={!eventsDetailContext.flags.canLock}
				isLocked={eventsDetailContext.data.event.is_locked}
				onClick={eventsDetailContext.actions.lock}
			/>

			<Button
				disabled={!eventsDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={eventsDetailContext.flags.isSaving}
				onClick={eventsDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta ocorrência? Esta ação não pode ser revertida."
				confirmTitle="Apagar Evento"
				isDisabled={!eventsDetailContext.flags.canDelete}
				onDelete={eventsDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
