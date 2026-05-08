'use client';

import { DataProviders } from '@/providers/data-providers';
import { StopsParameter } from '@tmlmobilidade/types';
import { closeModal, LocationsContextProvider, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { ParameterCreate } from './ParameterCreate';
import { ParameterCreateContextProvider } from './ParameterCreate.context';

/* * */

const MODAL_ID = 'create-parameter-modal';

/* * */

export const openCreateParameterModal = (agencyId: string, onSubmit: (rule: StopsParameter) => void, path, initialValues?: StopsParameter, onDelete?: () => void) => {
	openModal({
		children: (
			<MeContextProvider>
				<DataProviders agency_id={agencyId}>
					<LocationsContextProvider>
						<ParameterCreateContextProvider
							initialValues={initialValues}
							onDelete={onDelete}
							onSubmit={onSubmit}
							path={path}
						>
							<ParameterCreate />
						</ParameterCreateContextProvider>
					</LocationsContextProvider>
				</DataProviders>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: '80%',
		styles: {
			body: {
				height: '100%',
			},
			content: {
				height: '85vh',
			},
		},
		withCloseButton: false,
	});
};

/* * */

export const closeCreateParameterModal = () => {
	closeModal(MODAL_ID);
};
