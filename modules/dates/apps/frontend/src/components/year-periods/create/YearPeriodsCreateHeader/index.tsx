'use client';

import { closeYearPeriodsCreateModal } from '@/components/year-periods/create/YearPeriodsCreate.modal';
import { CloseButton, CreateButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useYearPeriodsCreateFormContext } from '../YearPeriodsCreateForm.context';

/* * */

export function YearPeriodsCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, form, status } = useYearPeriodsCreateFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeYearPeriodsCreateModal} type="close" />
			<Tag label="Novo Período" variant="muted" />
			<Label size="lg" singleLine>{nameValue}</Label>
			<Spacer />
			<CreateButton
				isDisabled={!capabilities.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
