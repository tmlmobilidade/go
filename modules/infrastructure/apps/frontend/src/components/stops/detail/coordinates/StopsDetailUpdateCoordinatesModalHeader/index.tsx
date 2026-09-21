'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeStopsDetailUpdateCoordinatesModal } from '../StopsDetailUpdateCoordinates.modal';
import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';

/* * */

export function StopsDetailUpdateCoordinatesModalHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, form, status, unblock } = useStopsDetailUpdateCoordinatesFormContext();

	//
	// B. Handle actions

	const handleClose = () => {
		form.reset();
		unblock();
		closeStopsDetailUpdateCoordinatesModal();
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Label size="lg" singleLine>{t('default:stops.detail.UpdateCoordinatesModal.Header.title')}</Label>
			<Spacer />
			<Button
				label={t('default:stops.detail.UpdateCoordinatesModal.Header.UpdateButton.label')}
				loading={status.isUpdating}
				onClick={actions.update}
			/>
		</Toolbar>
	);
}
