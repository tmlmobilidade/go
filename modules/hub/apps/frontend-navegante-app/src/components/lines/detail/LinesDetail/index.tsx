'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/ReactModalSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	// B. Render components

	return (
		<BottomSheet
			mapAware
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'lines-detail'}
			withCompactCloseButton
			withHeaderBackground
			withOverlay={false}
		>
			{activeBottomSheet?.entityId && <LinesDetailView />}
		</BottomSheet>
	);
}
