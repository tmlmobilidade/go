'use client';

/* * */

import { useValidationCreateContext } from '@/components/validations/create/ValidationCreate.context';
import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationCreateHeader() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateValidationModal} type="close" />
			<Label size="lg" caps singleLine>{t('plans:validations.create.ValidationCreateHeader.title')}</Label>
			<Spacer />
			<Button
				disabled={!validationCreateContext.flags.can_create}
				label={t('plans:validations.create.ValidationCreateHeader.actions.create.label')}
				loading={validationCreateContext.flags.loading}
				onClick={validationCreateContext.actions.createValidation}
			/>
		</Toolbar>
	);

	//
}
