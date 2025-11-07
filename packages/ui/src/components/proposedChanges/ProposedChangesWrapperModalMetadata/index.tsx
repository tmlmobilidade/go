/* * */

import { ProposedChange, User } from '@tmlmobilidade/types';

import styles from './styles.module.css';

import { ScopeEntityMap, ScopeKey } from '../../../contexts';
import { ProposedChangesWrapperModalTag } from '../ProposedChangesWrapperModalTag';
import { ProposedChangesWrapperModalUserMetadata } from '../ProposedChangesWrapperModalUserMetadata';

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
