/* * */

import { StopsTable } from '@/components/patterns/stopsTable/StopsTable';
import { Collapsible } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionStops() {
	//

	//
	// A. Render components

	return (
		<Collapsible description="Todas as paragens servidas por este pattern" title="Sequência de paragens">
			<StopsTable />
		</Collapsible>
	);

	//
}
