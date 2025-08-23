'use client';

/* * */

import { RidesListUpdatedAt } from '@/components/rides/list/RidesListUpdatedAt';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { Label, Loader, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RidesListHeader() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Circulações</Label>
			{ridesListContext.flags.loading && <Loader size="sm" />}
			<Spacer />
			<RidesListUpdatedAt />
			<Tag label={`Total ${ridesListContext.data.filtered.length}`} variant="muted" />
			<SearchInput onChange={ridesListContext.actions.setFilterSearch} value={ridesListContext.filters.search} />
		</Toolbar>
	);

	//
}
