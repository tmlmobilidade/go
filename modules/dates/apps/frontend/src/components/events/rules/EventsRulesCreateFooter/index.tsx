'use client';

import { closeEventsRulesCreateModal } from '@/components/events/rules/EventsRulesCreate.modal';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

export function EventsRulesCreateFooter() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, isEditing } = useEventsRulesCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button label="Cancelar" onClick={closeEventsRulesCreateModal} variant="danger" />
			<Button
				disabled={!capabilities.createEnabled}
				label={isEditing ? 'Editar' : 'Criar'}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
