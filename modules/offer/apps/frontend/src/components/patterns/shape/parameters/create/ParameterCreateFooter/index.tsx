'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { closeCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ParameterCreateFooter() {
	//

	//
	// A. Setup variables

	const parameterCreateContext = useParameterCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>

			<Spacer />

			<Button label="Cancelar" onClick={closeCreateParameterModal} variant="danger" />
			<Button
				disabled={!parameterCreateContext.data.form.isValid()}
				label={parameterCreateContext.flags.isEditing ? 'Editar' : 'Criar'}
				onClick={parameterCreateContext.actions.submitParameter}
			/>

		</Toolbar>
	);

	//
}
