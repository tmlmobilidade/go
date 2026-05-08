'use client';

import { PatternCreate } from '@/components/patterns/create/PatternCreate';
import { PatternCreateContextProvider } from '@/components/patterns/create/PatternCreate.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-pattern-modal';

/* * */

export const openCreatePatternModal = (lineId: string, routeId: string) => {
	openModal({
		children: (
			<MeContextProvider>
				<PatternCreateContextProvider lineId={lineId} routeId={routeId}>
					<PatternCreate />
				</PatternCreateContextProvider>
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

export const closeCreatePatternModal = () => {
	closeModal(MODAL_ID);
};
