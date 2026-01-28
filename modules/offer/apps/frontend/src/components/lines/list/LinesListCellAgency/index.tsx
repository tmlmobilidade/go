/* * */

import { Tag } from '@tmlmobilidade/ui';

/* * */

interface LinesListCellAgencyProps {
	agencyId: string
}

/* * */

export function LinesListCellAgency({ agencyId }: LinesListCellAgencyProps) {
	return <Tag label={agencyId} variant="muted" />;
}
