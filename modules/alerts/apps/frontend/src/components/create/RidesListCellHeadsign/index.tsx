'use client';

/* * */

import { type RideNormalized } from '@tmlmobilidade/types';
import { Label, Section, Tag } from '@tmlmobilidade/ui';

/* * */

interface RidesListCellHeadsignProps {
	headsign: RideNormalized['headsign']
	patternId: RideNormalized['pattern_id']
}

/* * */

export function RidesListCellHeadsign({ headsign, patternId }: RidesListCellHeadsignProps) {
	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			<Tag label={patternId} variant="secondary" />
			<Label size="md" singleLine>{headsign}</Label>
		</Section>
	);
}
