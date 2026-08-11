'use client';

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { DelayStatusDisplay, Section } from '@tmlmobilidade/ui';

/* * */

interface RidesListCellTimeObservedProps {
	delayStatus?: DelayStatus | null
	observedTimestamp?: null | UnixTimestamp
	scheduledTimestamp?: null | UnixTimestamp
}

/* * */

export function RidesListCellTimeObserved({ delayStatus, observedTimestamp, scheduledTimestamp }: RidesListCellTimeObservedProps) {
	//

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<DelayStatusDisplay
				endTimestamp={observedTimestamp}
				startTimestamp={scheduledTimestamp}
				status={delayStatus}
			/>
		</Section>
	);
}
