'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'lines-detail'}
			withOverlay={false}
			mapAware
			withCompactCloseButton
			withHeaderBackground
		>
			{activeBottomSheet?.entityId && <LinesDetailView />}
		</BottomSheet>
	);
}
