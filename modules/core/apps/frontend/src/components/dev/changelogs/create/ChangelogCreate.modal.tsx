'use client';

import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { ChangelogCreate } from './ChangelogCreate';
import { ChangelogCreateFormContextProvider } from './ChangelogCreateForm.context';

/* * */

const MODAL_ID = 'dev-changelog-create';

/* * */

export function openChangelogCreateModal() {
	//

	openModal({
		children: (
			<MeContextProvider>
				<ChangelogCreateFormContextProvider>
					<ChangelogCreate />
				</ChangelogCreateFormContextProvider>
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

export function closeChangelogCreateModal() {
	//

	closeModal(MODAL_ID);
}
