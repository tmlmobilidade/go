'use client';

import { VehiclesDetailContextProvider } from '@/components/vehicles/detail/VehiclesDetail.context';
import { VehiclesDetailView } from '@/components/vehicles/detail/VehiclesDetailView';
import { BottomSheet } from '@/components/viewport/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';

/* * */

export function VehiclesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'vehicles-detail'}
			size="half"
			title="Veículo"
		>
			{activeBottomSheet?.entityId && (
				<VehiclesDetailContextProvider vehicleId={activeBottomSheet.entityId}>
					<VehiclesDetailView />
				</VehiclesDetailContextProvider>
			)}
		</BottomSheet>
	);
}
