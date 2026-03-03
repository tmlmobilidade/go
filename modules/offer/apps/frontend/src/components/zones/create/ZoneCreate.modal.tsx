'use client';

/* * */

import { ZoneCreate } from '@/components/zones/create/ZoneCreate';
import { ZoneCreateContextProvider } from '@/components/zones/create/ZoneCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-zone-modal';

/* * */

export const openCreateZoneModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<ZoneCreateContextProvider>
						<ZoneCreate />
					</ZoneCreateContextProvider>
				</MeContextProvider>
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

export const closeCreateZoneModal = () => {
	closeModal(MODAL_ID);
};
