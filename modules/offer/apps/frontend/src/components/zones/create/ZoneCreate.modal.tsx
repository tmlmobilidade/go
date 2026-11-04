'use client';

import { ZoneCreate } from '@/components/zones/create/ZoneCreate';
import { ZonesCreateFormContextProvider } from '@/components/zones/create/ZonesCreateForm.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-zone-modal';

/* * */

export const openCreateZoneModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ZonesCreateFormContextProvider>
					<ZoneCreate />
				</ZonesCreateFormContextProvider>
			</MeContextProvider>
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

export const closeCreateZoneModal = () => {
	closeModal(MODAL_ID);
};
