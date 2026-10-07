'use client';

import { VehiclesCreate } from '@/components/vehicles/create/VehiclesCreate';
import { VehiclesCreateFormContextProvider } from '@/components/vehicles/create/VehiclesCreateForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'vehicles-create-modal';

/* * */

export const openVehiclesCreateModal = () => {
	openModal({
		children: (
			<VehiclesCreateFormContextProvider>
				<VehiclesCreate />
			</VehiclesCreateFormContextProvider>
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

export const closeVehiclesCreateModal = () => {
	closeModal(MODAL_ID);
};
