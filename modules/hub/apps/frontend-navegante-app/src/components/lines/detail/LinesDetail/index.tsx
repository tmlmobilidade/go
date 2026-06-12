'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { useLinesContext } from '@/components/lines/Lines.context';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	const linesContext = useLinesContext();
	const foundLineData = linesContext.data.lines.find(line => line._id === activeBottomSheet?.entityId);

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'lines-detail'}
			size="full"
			title={foundLineData?.long_name}
		>
			{activeBottomSheet?.entityId && (
				<LinesDetailContextProvider lineId={activeBottomSheet.entityId}>
					<LinesDetailView />
				</LinesDetailContextProvider>
			)}
		</BottomSheet>
	);
}
