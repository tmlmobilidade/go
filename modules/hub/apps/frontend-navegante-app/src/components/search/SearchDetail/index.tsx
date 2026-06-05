'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { LinesList } from '@/components/lines/list/LinesList';
import { useTranslation } from 'react-i18next';

/* * */

export function SearchDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'search'}
			title={t('default:search.SearchDetail.title')}
		>

			<LinesList />

		</BottomSheet>
	);
}
