'use client';

import { type DelayStatus } from '@tmlmobilidade/go-types-shared';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface DelayStatusDisplayProps {

	/**
	 * The delay status.
	 */
	status?: DelayStatus | null
}

/* * */

export function DelayStatusDisplay({ status }: DelayStatusDisplayProps) {
	//

	if (!status) {
		return null;
	}

	if (status === 'early') {
		return <Tag label="EARLY" variant="danger" />;
	}

	if (status === 'ontime') {
		return <Tag label="ON TIME" variant="success" />;
	}

	if (status === 'delayed') {
		return <Tag label="DELAYED" variant="warning" />;
	}
}
