'use client';

import { IconBus } from '@tabler/icons-react';
import { TagGroup, TagProps } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface RidesListCellVehiclesProps {
	value: string[]
}

/* * */

export function RidesListCellVehicles({ value }: RidesListCellVehiclesProps) {
	//

	const formattedTags: TagProps[] = useMemo(() => {
		if (!value?.length) return [];
		return value.map(vehicleId => ({
			icon: <IconBus size={16} />,
			label: vehicleId,
		}));
	}, [value]);

	return <TagGroup limit={1} tags={formattedTags} />;
}
