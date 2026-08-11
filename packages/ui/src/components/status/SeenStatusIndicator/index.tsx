/* * */

import { type SeenStatus } from '@tmlmobilidade/types';

import { Indicator } from '../Indicator';

/* * */

interface SeenStatusIndicatorProps {
	status?: SeenStatus
	tooltip?: string
}

/* * */

export function SeenStatusIndicator({ status, tooltip }: SeenStatusIndicatorProps) {
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
