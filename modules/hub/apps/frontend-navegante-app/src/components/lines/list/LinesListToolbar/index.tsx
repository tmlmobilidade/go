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
			<SearchInput onChange={linesListContext.actions.updateFilterBySearch} value={linesListContext.filters.by_search} />
		</Section>
	);
}
