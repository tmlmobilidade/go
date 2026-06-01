'use client';

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { SearchInput, Section } from '@tmlmobilidade/ui';

/* * */

export function LinesListToolbar() {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<Section>
			<SearchInput onChange={linesListContext.filters.search.set} value={linesListContext.filters.search.value} />
		</Section>
	);
}
