/* * */

import { Tag } from '../../tags/Tag';

/* * */

interface ProposedChangesWrapperModalTagProps {
	status: string
}

/* * */

export function ProposedChangesWrapperModalTag({ status }: ProposedChangesWrapperModalTagProps) {
	//

	//
	// A. Setup Variables

	const statusLabel = status === 'pending' ? 'Pendente' : status === 'approved' ? 'Aprovada' : status === 'rejected' ? 'Rejeitada' : 'Desconhecida';
	const colorLevel = status === 'pending' ? 'warning' : status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'muted';

	//
	// B. Render Components

	return (
		<Tag label={statusLabel} variant={colorLevel} />
	);

	//
}
