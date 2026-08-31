'use client';

import { CreateButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../SchoolsCreateForm.context';

/* * */

export function SchoolCreateHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, status } = useSchoolsCreateFormContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('schools:create.SchoolCreateHeader.title')}</Label>
			<Spacer />
			<CreateButton
				isDisabled={!capabilities?.createEnabled}
				isLoading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
