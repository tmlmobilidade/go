'use client';

import { CreateButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useSchoolsCreateFormContext } from '../SchoolsCreateForm.context';

/* * */

export function SchoolCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, status } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Nova Escola</Label>
			<Spacer />
			<CreateButton
				isDisabled={!capabilities?.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
