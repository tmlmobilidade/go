'use client';

import { closeEventsRulesCreateModal } from '@/components/events/rules/EventsRulesCreate.modal';
import { CloseButton, DeleteButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

export function EventsRulesCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, isEditing } = useEventsRulesCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeEventsRulesCreateModal} type="close" />
			<Tag label="Nova Regra" variant="muted" />
			<Spacer />
			{isEditing && actions.delete && (
				<DeleteButton onDelete={actions.delete} />
			)}
		</Toolbar>
	);
}
