'use client';

/* * */

import { ProposedChangesWrapperModalContent } from '@/components/proposedChanges/ProposedChangesWrapperModalContent';
import { ScopeEntityMap, ScopeKey } from '@/contexts/ProposedChanges.context';
import { ProposedChange } from '@go/types';
import { Modal } from '@mantine/core';

/* * */

interface ProposedChangesWrapperModalProps<S extends ScopeKey> {
	inputName: string
	isOpen: boolean
	label: string
	onClose: () => void
	originalInput: React.ReactElement<{ disabled?: boolean }>
	proposedChangesData?: ProposedChange<ScopeEntityMap[S]>[]
	relatedId: string
	scope: S
}

/* * */

export function ProposedChangesWrapperModal<S extends ScopeKey>({ inputName, isOpen, label, onClose, originalInput, proposedChangesData, relatedId, scope }: ProposedChangesWrapperModalProps<S>) {
	//

	//
	// A. Render Components

	return (
		<Modal onClose={onClose} opened={isOpen} size="xl" title={`Proposta de alteração para: ${label}`}>
			<ProposedChangesWrapperModalContent
				inputName={inputName}
				originalInput={originalInput}
				proposedChanges={proposedChangesData || []}
				relatedId={relatedId}
				scope={scope}
			/>
		</Modal>
	);

	//
};
