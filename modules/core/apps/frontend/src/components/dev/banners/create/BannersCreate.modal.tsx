'use client';

import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { BannersCreate } from './BannersCreate';
import { BannersCreateFormContextProvider } from './BannersCreateForm.context';

/* * */

const MODAL_ID = 'dev-banners-create';

/* * */

export function openBannersCreateModal() {
	//

	openModal({
		children: (
			<MeContextProvider>
				<BannersCreateFormContextProvider>
					<BannersCreate />
				</BannersCreateFormContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
}

/* * */

export function closeBannersCreateModal() {
	//

	closeModal(MODAL_ID);
}
