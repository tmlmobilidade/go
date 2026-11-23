'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeAlertsExtractModal } from '../AlertsExtract.modal';

/* * */

export function AlertsExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAlertsExtractModal} type="close" />
			<Label size="lg" singleLine>{t('alerts:extract.AlertsExtractHeader.title')}</Label>
		</Toolbar>
	);
}
