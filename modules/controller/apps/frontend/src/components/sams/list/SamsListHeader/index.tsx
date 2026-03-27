'use client';

import { useSamsListContext } from '@/contexts/SamsList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function SamsListHeader() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();

	//
	// B. Render components
	return (
		<Toolbar>
			<Label size="lg" caps singleLine>SAMs</Label>
			<Spacer />
			<SearchInput onChange={samsListContext.filters.search.set} value={samsListContext.filters.search.value} />
		</Toolbar>
	);
}
