'use client';

import { StopDetailCoordinatesModal } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal';
import { type Stop, type UpdateStopDto } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, Modal, type UseFormReturnType } from '@tmlmobilidade/ui';
import { createContext, useContext } from 'react';

/* * */

export interface StopDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		closeCoordinatesEditor: () => void
		openCoordinatesEditor: () => void
	}
	data: {
		form: UseFormReturnType<UpdateStopDto>
		stop: Stop | undefined
	}
	flags: DetailContextStateTemplate['flags'] & {
		isCoordinatesEditorOpen: boolean
	}
}

/* * */

export const StopDetailContext = createContext<StopDetailContextState | undefined>(undefined);

/* * */

export function useStopDetailContext() {
	const context = useContext(StopDetailContext);
	if (!context) {
		throw new Error('useStopDetailContext must be used within an StopDetailContextProvider');
	}
	return context;
}

/* * */

export function StopDetailCoordinatesEditorModal() {
	//

	//
	// A. Setup variables

	const { actions, flags } = useStopDetailContext();

	//
	// B. Render components

	return (
		<Modal
			closeOnClickOutside={false}
			closeOnEscape={false}
			onClose={actions.closeCoordinatesEditor}
			opened={flags.isCoordinatesEditorOpen}
			padding={0}
			size="xl"
			withCloseButton={false}
		>
			<StopDetailCoordinatesModal />
		</Modal>
	);

	//
}
