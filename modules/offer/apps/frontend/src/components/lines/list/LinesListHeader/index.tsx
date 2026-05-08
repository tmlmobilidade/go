'use client';

import { openCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { openGtfsExportModal } from '@/components/lines/export/GtfsExportModal';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { Button, IconButton, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function LinesListHeader() {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Linhas</Label>
			<Spacer />
			<SearchInput onChange={linesListContext.filters.search.set} value={linesListContext.filters.search.value} />
			<Button disabled={!linesListContext.flags.canCreate} label="Nova linha" leftSection={<IconPlus />} onClick={openCreateLineModal} />
			<IconButton icon={<IconFileDownload />} onClick={() => openGtfsExportModal()} tooltip="Exportar GTFS" variant="secondary" />
		</Toolbar>
	);

	//
}
