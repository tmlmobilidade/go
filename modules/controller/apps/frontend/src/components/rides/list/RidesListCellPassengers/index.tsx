'use client';

/* * */

import { Tag } from '@tmlmobilidade/ui';
import { IconUserFilled } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/go-controller-pckg-ride-normalized';

/* * */

interface RidesListCellPassengersProps {
	value: RideNormalized['passengers_estimated'] | RideNormalized['passengers_observed']
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
