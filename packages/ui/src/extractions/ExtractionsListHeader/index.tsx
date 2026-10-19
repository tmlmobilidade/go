'use client';

import { CloseButton, ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeExtractionsListModal } from '../ExtractionsList.modal';
import { ExtractionsListFilterSearch } from '../filters/ExtractionsListFilterSearch';
import { useExtractionsListData } from '../use-extractions-list-data';

/* * */

export function ExtractionsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useExtractionsListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data.length}
			leading={<CloseButton onClick={closeExtractionsListModal} type="close" />}
			search={<ExtractionsListFilterSearch />}
			title={t('shared:extractions.components.ExtractionsListHeader.title')}
		/>
	);
}
