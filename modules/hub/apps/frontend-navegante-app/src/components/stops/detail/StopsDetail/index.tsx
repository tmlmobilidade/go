'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailView } from '@/components/stops/detail/StopsDetailView';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'stops-detail'}
			withOverlay={false}
			mapAware
			withCompactCloseButton
			withHeaderBackground
		>
			{activeBottomSheet?.entityId && (
				<StopsDetailContextProvider stopId={activeBottomSheet.entityId}>
					<StopsDetailView />
				</StopsDetailContextProvider>
			)}
		</BottomSheet>
	);
}
