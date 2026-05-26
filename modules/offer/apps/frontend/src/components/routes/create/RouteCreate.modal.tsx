'use client';

import { RouteCreate } from '@/components/routes/create/RouteCreate';
import { RouteCreateContextProvider } from '@/components/routes/create/RouteCreate.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-route-modal';

/* * */

export const openCreateRouteModal = (lineId: string) => {
	openModal({
		children: (
			<MeContextProvider>
				<RouteCreateContextProvider lineId={lineId}>
					<RouteCreate />
				</RouteCreateContextProvider>
			</MeContextProvider>
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

export const closeCreateRouteModal = () => {
	closeModal(MODAL_ID);
};
