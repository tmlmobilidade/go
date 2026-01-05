'use client';

/* * */

import { VehicleImportContextProvider } from '@/components/Vehicles/import/VehicleImport.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, openModal } from '@tmlmobilidade/ui';

import { VehicleImport } from './VehicleImport';

/* * */

const MODAL_ID = 'import-vehicle-modal';

/* * */

export const openImportVehicleModal = () => {
	openModal({
		children: (
			<DataProviders>
				<VehicleImportContextProvider>
					<VehicleImport />
				</VehicleImportContextProvider>
			</DataProviders>
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

export const closeImportVehicleModal = () => {
	closeModal(MODAL_ID);
};
