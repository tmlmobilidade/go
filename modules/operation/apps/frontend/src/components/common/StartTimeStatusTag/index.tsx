/* * */

import { type DelayStatus } from '@tmlmobilidade/go-types-shared';
import { Section, Tag } from '@tmlmobilidade/ui';

/* * */

interface Props {
	delayValue?: null | string
	status: DelayStatus
	timeObserved: null | string
}

/* * */

export function TimeObservedStatusTag({ delayValue, status, timeObserved }: Props) {
	//

	if (!timeObserved) {
		return null;
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timeObserved} variant="secondary" />
				<Tag label="Ontime" variant="success" />
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timeObserved} variant="warning" />
				<Tag label={delayValue ? `Delayed ${delayValue}` : 'Delayed'} variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={timeObserved} variant="danger" />
				<Tag label={delayValue ? `Early ${delayValue}` : 'Early'} variant="danger" />
			</Section>
		);
	}

	//
}
