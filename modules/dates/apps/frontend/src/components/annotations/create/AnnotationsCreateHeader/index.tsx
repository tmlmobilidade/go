'use client';

import { closeAnnotationsCreateModal } from '@/components/annotations/create/AnnotationsCreate.modal';
import { CloseButton, CreateButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useAnnotationsCreateFormContext } from '../AnnotationsCreateForm.context';

/* * */

export function AnnotationsCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, form, status } = useAnnotationsCreateFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAnnotationsCreateModal} type="close" />
			<Tag label="Nova Anotação" variant="muted" />
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
