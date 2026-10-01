'use client';

import { VehiclesImportContextProvider } from '@/components/vehicles/import/VehiclesImport.context';
import { VehiclesImportFile } from '@/components/vehicles/import/VehiclesImportFile';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'vehicles-import-modal';

/* * */

export const openVehiclesImportModal = () => {
	openModal({
		children: (
			<VehiclesImportContextProvider>
				<VehiclesImportFile />
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
