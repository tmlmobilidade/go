'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { MAP_BOTTOM_SHEET_MIDDLE_SNAP } from '@/constants/bottom-sheet';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useTranslation } from 'react-i18next';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const { t } = useTranslation();
	const isOpen = activeBottomSheet?.view === 'lines-detail';
	const activeLineId = isOpen ? activeBottomSheet?.entityId : null;

	// B. Render components

	return (
		<BottomSheet
			accessibleTitle={t('default:lines.LinesDetail.title')}
			initialSnap={MAP_BOTTOM_SHEET_MIDDLE_SNAP}
			modality="non-modal"
			onClose={pop}
			opened={isOpen}
			withOverlay={false}
			mapAware
			withCompactCloseButton
		>
			{activeLineId && <LinesDetailView />}
		</BottomSheet>
	);
}
