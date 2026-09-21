'use client';

import { CloseButton, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeExtractionsListModal } from '../ExtractionsList.modal';
import { ExtractionsListFilterSearch } from '../filters/ExtractionsListFilterSearch';
import { useExtractionsListData } from '../use-extractions-list-data';

/* * */

export function ExtractionsListFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeExtractionsListModal} type="close" />
			<Spacer />
		</Toolbar>
	);
}
