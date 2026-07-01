'use client';

import { DataProviders } from '@/providers/data-providers';
import { AgenciesContextProvider, closeModal, ExportsContextProvider, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { AlertListExportModal } from '.';
import { AlertsListExportContextProvider } from '../AlertListExport.context';
import { AlertsListContextProvider } from '../AlertsList.context';

/* * */

const MODAL_ID = 'alert-list-export-modal';

/* * */

export const openAlertListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<AgenciesContextProvider>
						<ExportsContextProvider>
							<AlertsListContextProvider>
								<AlertsListExportContextProvider>
									<AlertListExportModal />
								</AlertsListExportContextProvider>
							</AlertsListContextProvider>
						</ExportsContextProvider>
					</AgenciesContextProvider>
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

export const closeAlertListExportModal = () => {
	closeModal(MODAL_ID);
};
