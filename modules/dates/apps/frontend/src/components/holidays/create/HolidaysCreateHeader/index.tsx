'use client';

import { closeHolidaysCreateModal } from '@/components/holidays/create/HolidaysCreate.modal';
import { CloseButton, CreateButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useHolidaysCreateFormContext } from '../HolidaysCreateForm.context';

/* * */

export function HolidaysCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, form, status } = useHolidaysCreateFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeHolidaysCreateModal} type="close" />
			<Tag label="Novo Feriado" variant="muted" />
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
