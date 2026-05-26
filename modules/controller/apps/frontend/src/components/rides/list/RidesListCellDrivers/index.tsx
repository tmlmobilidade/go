'use client';

import { IconSteeringWheelFilled } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/types';
import { TagGroup, TagProps } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellDriversProps {
	value: RideNormalized['driver_ids']
}

/* * */

export function RidesListCellDrivers({ value }: RidesListCellDriversProps) {
	//

	//
	// A. Transform data

	const formattedTags: TagProps[] = useMemo(() => {
		if (!value?.length) return [];
		return value.map(driverId => ({
			icon: <IconSteeringWheelFilled size={16} />,
			label: driverId,
		}));
	}, [value]);

	//
	// B. Render components

	return <TagGroup limit={1} tags={formattedTags} />;

	//
}
