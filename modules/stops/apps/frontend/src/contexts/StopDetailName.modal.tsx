'use client';

import { StopDetailNameModal } from '@/components/stops/detail/StopDetailCoordinates/StopDetailNamesModal';
import { useStopDetailContext } from '@/contexts/StopDetailCoordinates.modal';
import { Modal } from '@tmlmobilidade/ui';

/* * */

export function StopDetailNameEditorModal() {
	//

	//
	// A. Setup variables

	const { actions, flags } = useStopDetailContext();

	//
	// B. Render components

	return (
		<Modal
			closeOnClickOutside={true}
			closeOnEscape={true}
			onClose={actions.closeNameEditor}
			// opened={flags.isNameEditorOpen}
			opened={true}
			padding={0}
			size="xl"
			withCloseButton={false}
		>
			<StopDetailNameModal />
		</Modal>
	);

	//
}
