'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeZonesExportGeopackageModal } from '../ZonesExport.modal';
import { useZonesExportFormContext } from '../ZonesExportForm.context';

/* * */

export function ZonesExportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, status } = useZonesExportFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeZonesExportGeopackageModal} type="close" />
			<Label size="lg" caps singleLine>{t('zones:list.ZonesListExport.title')}</Label>
			<Spacer />
			<Button
				disabled={!capabilities?.createEnabled}
				label={t('zones:list.ZonesListExport.submit')}
				loading={status.isCreating}
				onClick={actions.exportGeopackage}
			/>
		</Toolbar>
	);

	//
}
