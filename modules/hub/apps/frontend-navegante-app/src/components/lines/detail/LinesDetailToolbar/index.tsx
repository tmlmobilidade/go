'use client';

import { SelectOperationalDate } from '@/components/common/operational-date/SelectOperationalDate';
import { SelectActivePatternGroup } from '@/components/lines/detail/SelectActivePatternGroup';
import { Section, Surface } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailToolbar() {
	return (
		<Surface variant="plain">
			<Section gap="xs">
				<SelectOperationalDate />
				<SelectActivePatternGroup />
			</Section>
		</Surface>
	);
}
