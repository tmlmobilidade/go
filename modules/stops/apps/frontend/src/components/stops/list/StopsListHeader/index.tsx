/* * */

import { openStopCreateModal } from '@/components/stops/create/StopCreate.modal';
import { openStopListExportModal } from '@/components/stops/list/StopListExportModal/StopListExport.modal';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, IconButton, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useStopsListFilterSearch } from './use-stops-list-filter-search';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const filterSearch = useStopsListFilterSearch();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Paragens</Label>
			<Spacer />
			<SearchInput onChange={filterSearch.set} value={filterSearch.value} />
			<HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openStopCreateModal} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.stops.actions.export} scope={PermissionCatalog.all.stops.scope}>
				<IconButton icon={<IconFileDownload />} onClick={openStopListExportModal} tooltip="Exportar paragens" variant="secondary" />
			</HasPermission>
		</Toolbar>
	);

	//
}
