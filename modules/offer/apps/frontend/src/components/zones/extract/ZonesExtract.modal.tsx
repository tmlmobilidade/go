'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import { ZonesExtract } from './ZonesExtract';
import { ZonesExtractFormContextProvider } from './ZonesExtractForm.context';

/* * */

const MODAL_ID = 'zones-extract-modal';

/* * */

export function openZonesExtractModal(zoneIds: string[]) {
	openModal({
		children: (
			<ZonesExtractFormContextProvider onClose={closeZonesExtractModal} zoneIds={zoneIds}>
				<ZonesExtract />
			</ZonesExtractFormContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
}

export function closeZonesExtractModal() {
	closeModal(MODAL_ID);
}
