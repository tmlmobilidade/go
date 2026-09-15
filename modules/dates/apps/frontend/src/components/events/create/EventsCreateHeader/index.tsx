'use client';

import { closeEventsCreateModal } from '@/components/events/create/EventsCreate.modal';
import { CloseButton, CreateButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useEventsCreateFormContext } from '../EventsCreateForm.context';

/* * */

export function EventsCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, form, status } = useEventsCreateFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeEventsCreateModal} type="close" />
			<Tag label="Novo Evento" variant="muted" />
			<Label size="lg" singleLine>{titleValue}</Label>
			<Spacer />
			<CreateButton
				isDisabled={!capabilities.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
