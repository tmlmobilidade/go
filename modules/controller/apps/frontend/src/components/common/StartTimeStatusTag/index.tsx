/* * */

import { RideNormalized } from '@tmlmobilidade/types';
import { Section, Tag } from '@tmlmobilidade/ui';

/* * */

interface Props {
	delayValue?: null | string
	startTimeObserved: null | string
	status: RideNormalized['start_delay_status']
}

/* * */

export function StartTimeStatusTag({ delayValue, startTimeObserved, status }: Props) {
	//

	if (!startTimeObserved) {
		return null;
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={startTimeObserved} variant="secondary" />
				<Tag label="Ontime" variant="success" />
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={startTimeObserved} variant="warning" />
				<Tag label={delayValue ? `Delayed ${delayValue}` : 'Delayed'} variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={startTimeObserved} variant="danger" />
				<Tag label={delayValue ? `Early ${delayValue}` : 'Early'} variant="danger" />
			</Section>
		);
	}

	//
}
