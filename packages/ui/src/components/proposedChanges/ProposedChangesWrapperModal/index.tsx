'use client';

import { Modal } from '@mantine/core';
import { ProposedChange } from '@tmlmobilidade/types';

import { ScopeEntityMap, ScopeKey } from '../../../contexts';
import { ProposedChangesWrapperModalContent } from '../ProposedChangesWrapperModalContent';

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
