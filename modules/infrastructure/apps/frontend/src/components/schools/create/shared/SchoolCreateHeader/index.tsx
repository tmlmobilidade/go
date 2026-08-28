'use client';

import { CreateButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useSchoolsCreateFormContext } from '../SchoolsCreateForm.context';
import { useSchoolsCreatePublish } from '../use-schools-create-publish';

/* * */

export function SchoolCreateHeader() {
	//

	//
	// A. Setup variables

	const { isDirty, isValid } = useSchoolsCreateFormContext();
	const { isLoading, publish } = useSchoolsCreatePublish();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Nova Escola</Label>
			<Spacer />
			<CreateButton
				isDisabled={!isDirty || !isValid}
				isLoading={isLoading}
				onClick={publish}
			/>
		</Toolbar>
	);
}
