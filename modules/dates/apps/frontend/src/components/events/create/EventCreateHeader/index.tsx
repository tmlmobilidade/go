'use client';

/* * */

import { useEventCreateContext } from '@/components/events/create/EventCreate.context';
import { closeCreateEventModal } from '@/components/events/create/EventCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function EventCreateHeader() {
	//

	//
	// A. Setup variables

	const eventCreateContext = useEventCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateEventModal} type="close" />
			<Tag label="Novo Evento" variant="muted" />
			<Label size="lg" singleLine>{eventCreateContext.data.form.values.title}</Label>
			<Spacer />
			<Button
				disabled={!eventCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={eventCreateContext.flags.isSaving}
				onClick={eventCreateContext.actions.createEvent}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
