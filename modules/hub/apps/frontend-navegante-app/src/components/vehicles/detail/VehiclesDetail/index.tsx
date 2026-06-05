'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { VehiclesDetailContextProvider } from '@/components/vehicles/detail/VehiclesDetail.context';
import { VehiclesDetailView } from '@/components/vehicles/detail/VehiclesDetailView';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'vehicles-detail'}
			size="half"
			title={t('default:vehicles.VehiclesDetail.title')}
		>
			{activeBottomSheet?.entityId && (
				<VehiclesDetailContextProvider vehicleId={activeBottomSheet.entityId}>
					<VehiclesDetailView />
				</VehiclesDetailContextProvider>
			)}
		</BottomSheet>
	);
}
