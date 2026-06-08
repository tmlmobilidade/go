'use client';

import { AlertsListContextProvider } from '@/components/alerts/list/AlertsList.context';
import { AlertsListViewList } from '@/components/alerts/list/AlertsListViewList';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { LinesListViewAll } from '@/components/lines/list/LinesListViewAll';
import { SearchToolbar, type SearchType } from '@/components/search/SearchToolBar';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { StopsListViewList } from '@/components/stops/list/StopsListViewList';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [searchType, setSearchType] = useState<SearchType>('lines');

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'search'}
			size="full"
			title={t('default:search.SearchDetail.title')}
		>
			<SearchToolbar onChangeSearchType={setSearchType} searchType={searchType} />

			{searchType === 'lines' && (
				<LinesListContextProvider>
					<LinesListViewAll />
				</LinesListContextProvider>
			)}

			{searchType === 'stops' && (
				<StopsListContextProvider>
					<StopsListViewList />
				</StopsListContextProvider>
			)}

			{searchType === 'alerts' && (
				<AlertsListContextProvider>
					<AlertsListViewList />
				</AlertsListContextProvider>
			)}
		</BottomSheet>
	);
}
