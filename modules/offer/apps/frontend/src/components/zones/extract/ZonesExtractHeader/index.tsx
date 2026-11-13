'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeZonesExtractModal } from '../ZonesExtract.modal';

/* * */

export function ZonesExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeZonesExtractModal} type="close" />
			<Label size="lg" singleLine>{t('default:zones.extract.ZonesExtractHeader.title')}</Label>
		</Toolbar>
	);
}
