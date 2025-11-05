/* * */

import { ProposedChangesWrapperModalTag } from '@/components/proposedChanges/ProposedChangesWrapperModalTag';
import { ProposedChangesWrapperModalUserMetadata } from '@/components/proposedChanges/ProposedChangesWrapperModalUserMetadata';
import { ScopeEntityMap, ScopeKey } from '@/contexts/ProposedChanges.context';
import { ProposedChange, User } from '@go/types';

import styles from './styles.module.css';

/* * */

interface ProposedChangesWrapperModalMetadataProps<S extends ScopeKey> {
	proposedChangeData: ProposedChange<ScopeEntityMap[S]>
}

/* * */

export function ProposedChangesWrapperModalMetadata<S extends ScopeKey>({ proposedChangeData }: ProposedChangesWrapperModalMetadataProps<S>) {
	//

	//
	// A. Render Components

	return (
		<div className={styles.metadataWrapper}>
			<div className={styles.metadataLeft}>
				<ProposedChangesWrapperModalUserMetadata createdAt={proposedChangeData.created_at} createdBy={proposedChangeData.created_by as Partial<User>} />
			</div>
			<div className={styles.metadataBadge}>
				<ProposedChangesWrapperModalTag status={proposedChangeData.status} />
			</div>
		</div>
	);

	//
}
