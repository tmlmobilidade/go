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
	const { t } = useTranslation('plans');

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateValidationModal} type="close" />
			<Label size="lg" caps singleLine>{t('validations.create.Header.title')}</Label>
			<Spacer />
			<Button
				disabled={!validationCreateContext.flags.can_create}
				label={t('validations.create.Header.create_validation_button')}
				loading={validationCreateContext.flags.loading}
				onClick={validationCreateContext.actions.createValidation}
			/>
		</Toolbar>
	);

	//
}
