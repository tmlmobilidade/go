'use client';

import { DataProviders } from '@/providers/data-providers';
import { AgenciesContextProvider, closeModal, openModal } from '@tmlmobilidade/ui';

import { AlertListExportModal } from '.';
import { AlertsListExportContextProvider } from '../AlertListExport.context';

/* * */

const MODAL_ID = 'alert-list-export-modal';

/* * */

export const openAlertListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<AgenciesContextProvider>
					<AlertsListExportContextProvider>
						<AlertListExportModal />
					</AlertsListExportContextProvider>
				</AgenciesContextProvider>
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

export const closeAlertListExportModal = () => {
	closeModal(MODAL_ID);
};
