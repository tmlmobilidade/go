'use client';

/* * */

import { openRideExportModal } from '@/components/rides/export/RidesExportModal';
import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { RidesListLastUpdatedAt } from '@/components/rides/list/RidesListLastUpdatedAt';
import { IconFileDownload } from '@tabler/icons-react';
import { IconButton, Label, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

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
			<RidesListLastUpdatedAt isLoading={ridesListContext.flags.loading} />
			<Spacer shrink />
			<Tag label={`Total ${ridesListContext.data.filtered.length}`} variant="muted" />
			<SearchInput onChange={ridesListContext.filters.search.set} value={ridesListContext.filters.search.value} />
			<IconButton icon={<IconFileDownload />} onClick={() => openRideExportModal(ridesListContext.filters)} tooltip="Exportar Circulações" variant="secondary" />
		</Toolbar>
	);

	//
}
