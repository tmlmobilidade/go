'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { VehiclesDetailContextProvider } from '@/components/vehicles/detail/VehiclesDetail.context';
import { VehiclesDetailView } from '@/components/vehicles/detail/VehiclesDetailView';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const { t } = useTranslation();
	const isOpen = activeBottomSheet?.view === 'vehicles-detail';
	const activeVehicleId = isOpen ? activeBottomSheet?.entityId : null;

	//
	// B. Render components

	return (
		<BottomSheet
			accessibleTitle={t('default:vehicles.VehiclesDetail.title')}
			modality="non-modal"
			onClose={pop}
			opened={isOpen}
			withOverlay={false}
			mapAware
			withCompactCloseButton
			withHeaderBackground
		>
			{activeVehicleId && (
				<VehiclesDetailContextProvider vehicleId={activeVehicleId}>
					<VehiclesDetailView />
				</VehiclesDetailContextProvider>
			)}
		</BottomSheet>
	);
}
