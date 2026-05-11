'use client';

import { ValidationCreate } from '@/components/validations/create/ValidationCreate';
import { ValidationCreateContextProvider } from '@/components/validations/create/ValidationCreate.context';
import { DataProviders } from '@/providers/data-providers';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-validation-modal';

/* * */

export const openCreateValidationModal = () => {
	openModal({
		children: (
			<DataProviders>
				<MeContextProvider>
					<ValidationCreateContextProvider>
						<ValidationCreate />
					</ValidationCreateContextProvider>
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

export const closeCreateValidationModal = () => {
	closeModal(MODAL_ID);
};
