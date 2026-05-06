'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { closeCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { CloseButton, DeleteButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ParameterCreateHeader() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useParameterCreateContext();
	const isDefaultRule = ruleCreateContext.data.form?.values.kind === 'default';

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateParameterModal} type="close" />
			<Tag label={ruleCreateContext.data.parameterForUI.name || 'Nova Regra'} variant="muted" />

			<Spacer />

			{!isDefaultRule && ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteParameter && (
				<DeleteButton onDelete={ruleCreateContext.actions.deleteParameter} />
			)}

		</Toolbar>
	);

	//
}
