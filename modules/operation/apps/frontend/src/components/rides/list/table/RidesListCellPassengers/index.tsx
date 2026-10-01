'use client';

import { IconUserFilled } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface RidesListCellPassengersProps {
	value: number | number
}

/* * */

export function RidesListCellPassengers({ value }: RidesListCellPassengersProps) {
	//

	if (value === undefined || value === null || value === 0) {
		return null;
	}

	return <Tag icon={<IconUserFilled />} label={value} variant="secondary" />;

	//
}
