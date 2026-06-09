'use client';

import { SelectOperationalDate } from '@/components/common/operational-date/SelectOperationalDate';
import { StopsDetailViewHeaderAssociatedLines } from '@/components/stops/detail/StopsDetailViewHeaderAssociatedLines';
import { StopsDetailViewHeaderMetadata } from '@/components/stops/detail/StopsDetailViewHeaderMetadata';
import { Section, Surface } from '@tmlmobilidade/ui';

/* * */

export function StopsDetailViewHeader() {
	return (
		<Surface variant="plain">
			<Section>
				<StopsDetailViewHeaderMetadata />
				<StopsDetailViewHeaderAssociatedLines />
				<SelectOperationalDate />
			</Section>
		</Surface>
	);
}
