'use client';

import { VehicleImport } from '@/components/vehicles/import/vehicleImport';
import { VehiclesImportContextProvider } from '@/components/vehicles/import/VehiclesImport.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'vehicles-import-modal';

/* * */

export const openVehiclesImportModal = () => {
	openModal({
		children: (
			<VehiclesImportContextProvider>
				<VehicleImport />
			</VehiclesImportContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeVehiclesImportModal = () => {
	closeModal(MODAL_ID);
};
