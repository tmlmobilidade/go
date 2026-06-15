'use client';

import { openCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { openGtfsExportModal } from '@/components/lines/export/GtfsExportModal';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { openVkmModal } from '@/components/lines/vkms/VkmModal';
import { IconDots, IconFileDownload, IconPlus, IconSearch } from '@tabler/icons-react';
import { Label, Menu, MenuItem, MenuLabel, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
			<Menu icon={IconDots} label="Mais opções">
				<MenuLabel>Ações</MenuLabel>
				<MenuItem
					disabled={!linesListContext.flags.canCreate}
					leftSection={<IconPlus size={20} />}
					onClick={openCreateLineModal}
					title="Nova linha"
				/>
				<MenuItem
					leftSection={<IconFileDownload size={20} />}
					onClick={openGtfsExportModal}
					title="Exportar GTFS"
				/>
				<MenuItem
					leftSection={<IconSearch size={20} />}
					onClick={openVkmModal}
					title="Consultar VKM"
				/>
			</Menu>
		</Toolbar>
	);

	//
}
