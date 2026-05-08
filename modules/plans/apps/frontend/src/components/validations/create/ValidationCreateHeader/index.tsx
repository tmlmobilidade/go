'use client';

import { useValidationCreateContext } from '@/components/validations/create/ValidationCreate.context';
import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ValidationCreateHeader() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateValidationModal} type="close" />
			<Label size="lg" caps singleLine>Nova Validação GTFS</Label>
			<Spacer />
			<Button
				disabled={!validationCreateContext.flags.can_create}
				label="Criar validação"
				loading={validationCreateContext.flags.loading}
				onClick={validationCreateContext.actions.createValidation}
			/>
		</Toolbar>
	);

	//
}
