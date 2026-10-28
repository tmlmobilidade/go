'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeNodesExtractModal } from '../NodesExtract.modal';

/* * */

export function NodesExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeNodesExtractModal} type="close" />
			<Label size="lg" singleLine>{t('stops:extract.NodesExtractHeader.title')}</Label>
		</Toolbar>
	);
}
