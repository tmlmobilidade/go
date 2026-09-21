'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeStopsExtractModal } from '../StopsExtract.modal';

/* * */

export function StopsExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeStopsExtractModal} type="close" />
			<Label size="lg" singleLine>{t('default:stops.extract.Header.title')}</Label>
		</Toolbar>
	);
}
