'use client';

import { type SeenStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayUnixTimestamp, SeenStatusIndicator } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellSeenLastAtProps {
	status: SeenStatus
	timestamp: UnixTimestamp
}

/* * */

export function RidesListCellSeenLastAt({ status, timestamp }: RidesListCellSeenLastAtProps) {
	//

	const tooltipValue = useMemo(() => {
		return displayUnixTimestamp(timestamp);
	}, [timestamp]);

	return <SeenStatusIndicator status={status} tooltip={tooltipValue} />;
}
