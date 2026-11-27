'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeZonesExtractGeopackageModal } from '../ZonesExtract.modal';
import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, status } = useZonesExtractFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeZonesExtractGeopackageModal} type="close" />
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
