/* * */

import { StopsTable } from '@/components/patterns/table/StopsTable';
import { Collapsible, Section } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionZones() {
	//

	//
	// A. Render components

	return (
		<Collapsible title="Afetação">
			<Section>
				<StopsTable />
			</Section>
		</Collapsible>
	);

	//
}
