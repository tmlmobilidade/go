'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeStopsDetailUpdateNameModal } from '../StopsDetailUpdateName.modal';
import { useStopsDetailUpdateNameFormContext } from '../StopsDetailUpdateNameForm.context';

/* * */

export function StopsDetailUpdateNameModalHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, form, status, unblock } = useStopsDetailUpdateNameFormContext();

	//
	// B. Handle actions

	const handleClose = () => {
		form.reset();
		unblock();
		closeStopsDetailUpdateNameModal();
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Label size="lg" singleLine>{t('stops:detail.StopsDetailUpdateNameModalHeader.title')}</Label>
			<Spacer />
			<Button
				label={t('stops:detail.StopsDetailUpdateNameModalHeader.update_button.label')}
				loading={status.isUpdating}
				onClick={actions.update}
			/>
		</Toolbar>
	);
}
