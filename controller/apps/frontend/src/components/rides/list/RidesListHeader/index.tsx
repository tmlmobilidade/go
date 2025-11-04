'use client';

/* * */

import { openRideExportModal } from '@/components/rides/list/RidesExportModal';
import { RidesListUpdatedAt } from '@/components/rides/list/RidesListUpdatedAt';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { IconFileDownload } from '@tabler/icons-react';
import { IconButton, Label, Loader, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

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
			<Spacer shrink />
			<RidesListUpdatedAt />
			<Tag label={`Total ${ridesListContext.data.filtered.length}`} variant="muted" />
			<SearchInput onChange={ridesListContext.actions.setFilterSearch} value={ridesListContext.filters.search} />
			<IconButton icon={<IconFileDownload />} onClick={() => openRideExportModal(ridesListContext.filters)} tooltip="Exportar Circulações" variant="secondary" />
		</Toolbar>
	);

	//
}
