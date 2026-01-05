'use client';

/* * */

import { FareCreate } from '@/components/fares/create/FareCreate';
import { FareCreateContextProvider } from '@/components/fares/create/FareCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-fare-modal';

/* * */

export const openCreateFareModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<FareCreateContextProvider>
						<FareCreate />
					</FareCreateContextProvider>
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

export const closeCreateFareModal = () => {
	closeModal(MODAL_ID);
};
