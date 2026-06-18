'use client';

import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { ZoneListExportModal } from '.';
import { ZonesListContextProvider } from '../ZonesList.context';

/* * */

const MODAL_ID = 'stop-list-export-modal';

/* * */

export const openZoneListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<ZonesListContextProvider>
						<ZoneListExportModal />
					</ZonesListContextProvider>
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

export const closeZoneListExportModal = () => {
	closeModal(MODAL_ID);
};

