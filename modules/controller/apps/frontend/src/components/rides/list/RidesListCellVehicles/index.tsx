'use client';

import { IconBus } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/types';
import { TagGroup, TagProps } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellVehiclesProps {
	value: RideNormalized['vehicle_ids']
}

/* * */

export function RidesListCellVehicles({ value }: RidesListCellVehiclesProps) {
	//

	//
	// A. Transform data

	const formattedTags: TagProps[] = useMemo(() => {
		if (!value?.length) return [];
		return value.map(vehicleId => ({
			icon: <IconBus size={16} />,
			label: vehicleId,
		}));
	}, [value]);

	//
	// B. Render components

	return <TagGroup limit={1} tags={formattedTags} />;

	//
}
