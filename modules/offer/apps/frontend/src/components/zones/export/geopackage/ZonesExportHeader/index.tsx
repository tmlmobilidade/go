'use client';

import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeZonesExportGeopackageModal } from '../ZonesListExport.modal';
/* * */

export function ZonesExportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeZonesExportGeopackageModal} type="close" />
			<Label size="lg" caps singleLine>{t('zones:list.ZonesListExport.title')}</Label>
			<Spacer />
		</Toolbar>
	);

	//
}
