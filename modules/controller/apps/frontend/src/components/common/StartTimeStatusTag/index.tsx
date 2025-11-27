/* * */

import { type RideNormalized } from '@tmlmobilidade/types';
import { Section, Tag } from '@tmlmobilidade/ui';

/* * */

interface Props {
	startTimeObserved: string
	status: RideNormalized['start_delay_status']
}

/* * */

export function StartTimeStatusTag({ startTimeObserved, status }: Props) {
	//

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
				<Tag label="Delayed" variant="warning" />
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				<Tag label={startTimeObserved} variant="danger" />
				<Tag label="Early" variant="danger" />
			</Section>
		);
	}

	//
}
