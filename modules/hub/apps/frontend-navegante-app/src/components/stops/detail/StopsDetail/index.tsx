'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailView } from '@/components/stops/detail/StopsDetailView';
import { useStopsContext } from '@/components/stops/Stops.context';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	const stopsContext = useStopsContext();
	const foundStopData = stopsContext.actions.getStopById(activeBottomSheet?.entityId);

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'stops-detail'}
			size="full"
			title={foundStopData?.name}
		>
			<StopsDetailContextProvider stopId={activeBottomSheet?.entityId}>
				<StopsDetailView />
			</StopsDetailContextProvider>
		</BottomSheet>
	);
}
