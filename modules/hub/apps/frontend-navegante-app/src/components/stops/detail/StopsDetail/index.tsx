'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailView } from '@/components/stops/detail/StopsDetailView';
import { MAP_BOTTOM_SHEET_MIDDLE_SNAP } from '@/constants/bottom-sheet';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const { t } = useTranslation();
	const isOpen = activeBottomSheet?.view === 'stops-detail';
	const activeStopId = isOpen ? activeBottomSheet?.entityId : null;

	//
	// B. Render components

	return (
		<BottomSheet
			accessibleTitle={t('default:stops.StopsDetail.title')}
			initialSnap={MAP_BOTTOM_SHEET_MIDDLE_SNAP}
			modality="non-modal"
			onClose={pop}
			opened={isOpen}
			withOverlay={false}
			mapAware
			withCompactCloseButton
			withHeaderBackground
		>
			{activeStopId && (
				<StopsDetailContextProvider stopId={activeStopId}>
					<StopsDetailView />
				</StopsDetailContextProvider>
			)}
		</BottomSheet>
	);
}
