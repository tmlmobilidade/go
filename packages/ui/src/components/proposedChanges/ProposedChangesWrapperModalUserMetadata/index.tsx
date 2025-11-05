/* * */

import { UnixTimestamp, User } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

interface ProposedChangesWrapperModalUserMetadataProps {
	createdAt: UnixTimestamp
	createdBy: Partial<User>
}

/* * */

export function ProposedChangesWrapperModalUserMetadata({ createdAt, createdBy }: ProposedChangesWrapperModalUserMetadataProps) {
	//

	//
	// A. Render Components

	return (
		<>
			<p>{createdBy.first_name + ' ' + createdBy.last_name}</p>
			<p>{Dates.fromUnixTimestamp(createdAt).setZone('Europe/Lisbon', 'rebase_utc').toLocaleString(Dates.FORMATS.DATETIME_MEDIUM)}</p>
		</>

	);

	//
}
