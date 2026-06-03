'use client';

import { SelectOperationalDate } from '@/components/lines/common/SelectOperationalDate';
import { SelectActivePatternGroup } from '@/components/lines/detail/SelectActivePatternGroup';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailToolbar() {
	return (
		<Section>
			<SelectOperationalDate />
			<SelectActivePatternGroup />
		</Section>
	);
}
