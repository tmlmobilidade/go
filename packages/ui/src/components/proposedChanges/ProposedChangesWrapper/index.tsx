'use client';

import { IconInfoCircle } from '@tabler/icons-react';
import { ApprovalStatus, ProposedChange } from '@tmlmobilidade/types';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { ScopeEntityMap, ScopeKey, useMeContext, useProposedChangesContext } from '../../../contexts';
import { ProposedChangesWrapperModal } from '../ProposedChangesWrapperModal';

/* * */

interface ProposedChangesWrapperProps<S extends ScopeKey> {
	children: React.ReactElement<{ disabled?: boolean }>
	inputName: string
	label?: string
	relatedId: string
	scope: S
}

/* * */

export function ProposedChangesWrapper<S extends ScopeKey>({ children, inputName, label, relatedId, scope }: ProposedChangesWrapperProps<S>) {
	//

	//
	// A. Setup variables
	const meContext = useMeContext();
	const proposedChangesContext = useProposedChangesContext(scope);

	const [proposedChangesOfField, setProposedChangesOfField] = useState<ProposedChange<ScopeEntityMap[S]>[]>();
	const [opened, setOpened] = useState(false);
	const [status, setStatus] = useState<'none' | ApprovalStatus>('none');
	const isCheckbox = children.type.toString().toLowerCase().includes('checkbox');
	const colorLevel = status === 'pending' ? 'var(	--color-status-warning-primary)' : status === 'approved' ? ' var(--color-status-success-primary)' : status === 'rejected' ? 'var(--color-status-danger-primary)' : 'var(--color-system-text-200)';

	useEffect(() => {
		const hasPending = proposedChangesContext.data.allProposedChangesByRelatedId?.find(pc => pc?.status === 'pending' && pc.field === inputName);
		const proposedChangesByRelatedIdAndField = proposedChangesContext.data.allProposedChangesByRelatedId?.filter(pc => pc.field === inputName);
		setStatus(hasPending ? 'pending' : 'none');
		setProposedChangesOfField(proposedChangesByRelatedIdAndField);
	}, [inputName, proposedChangesContext.data.allProposedChangesByRelatedId]);

	//
	// B. Render Components

	return (
		<div className={isCheckbox ? styles.checkboxWrapper : ''}>
			<div className={styles.labelWrapper}>
				{label}
				{meContext.data.user?.permissions.find(p => p.action === 'read' && p.scope === 'sams') && <IconInfoCircle color={colorLevel} onClick={() => setOpened(!opened)} size={18} /> }
				<ProposedChangesWrapperModal
					inputName={inputName}
					isOpen={opened}
					label={label || ''}
					onClose={() => setOpened(!opened)}
					originalInput={children}
					proposedChangesData={proposedChangesOfField}
					relatedId={relatedId}
					scope={scope}
				/>
			</div>
			{children}
		</div>
	);

	//
};
