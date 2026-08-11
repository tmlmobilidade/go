/* * */

import { type DelayStatus } from '@tmlmobilidade/go-types-shared';
import { Section, Tag } from '@tmlmobilidade/ui';

/* * */

interface DelayStatusDisplayProps {
	delayValue?: null | string
	status?: DelayStatus | null
	timestamp?: null | string
}

/* * */

export function DelayStatusDisplay({ delayValue, status, timestamp }: DelayStatusDisplayProps) {
	//

	if (!delayValue || !timestamp) {
		return null;
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timestamp} variant="secondary" />
				<Tag label="Ontime" variant="success" />
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timestamp} variant="warning" />
				<Tag label={delayValue ? `Delayed ${delayValue}` : 'Delayed'} variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timestamp} variant="danger" />
				<Tag label={delayValue ? `Early ${delayValue}` : 'Early'} variant="danger" />
			</Section>
		);
	}

	//
}
