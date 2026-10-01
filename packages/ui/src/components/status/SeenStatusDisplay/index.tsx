/* * */

import { type SeenStatus } from '@tmlmobilidade/go-types-shared';

import { Indicator } from '../../display/Indicator';

/* * */

interface SeenStatusDisplayProps {
	status?: null | SeenStatus
	tooltip?: string
}

/* * */

export function SeenStatusDisplay({ status, tooltip }: SeenStatusDisplayProps) {
	//

	if (status === 'unseen') {
		return <Indicator tooltip={tooltip} variant="muted" />;
	}

	if (status === 'seen') {
		return <Indicator tooltip={tooltip} variant="primary" filled />;
	}

	if (status === 'gone') {
		return <Indicator tooltip={tooltip} variant="muted" filled />;
	}

	return null;

	//
}
