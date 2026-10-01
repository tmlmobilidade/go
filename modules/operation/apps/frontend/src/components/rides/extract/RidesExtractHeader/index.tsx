'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeRidesExtractModal } from '../RidesExtract.modal';

/* * */

export function RidesExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeRidesExtractModal} type="close" />
			<Label size="lg" singleLine>{t('default:rides.extract.RidesExtractHeader.title')}</Label>
		</Toolbar>
	);
}
