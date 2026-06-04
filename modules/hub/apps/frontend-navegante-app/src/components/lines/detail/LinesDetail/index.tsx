'use client';

import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { BottomSheet } from '@/components/viewport/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'line-detail'}
		>
			{activeBottomSheet?.entityId && (
				<LinesDetailContextProvider lineId={activeBottomSheet.entityId}>
					<LinesDetailView />
				</LinesDetailContextProvider>
			)}
		</BottomSheet>
	);
}
