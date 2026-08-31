/* * */

import { openStopCreateModal } from '@/components/stops/create/StopCreate.modal';
import { openStopListExportModal } from '@/components/stops/list/StopListExportModal/StopListExport.modal';
import { IconFileDownload, IconGardenCart, IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, IconButton, Label, LoadingActivity, Menu, MenuItem, MenuLabel, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { StopsListFilterSearch } from '../filters/StopsListFilterSearch';
import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useStopsListData();

	//
	// B. Render components

	// <HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
	// 			<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openStopCreateModal} />
	// 		</HasPermission>
	// 		<HasPermission action={PermissionCatalog.all.stops.actions.export} scope={PermissionCatalog.all.stops.scope}>
	// 			<IconButton icon={<IconFileDownload />} onClick={openStopListExportModal} tooltip="Exportar paragens" variant="secondary" />
	// 		</HasPermission>
	// 	</Toolbar>

	return (
		<Menu icon={IconGardenCart}>
			<MenuLabel>Paragens</MenuLabel>
			<MenuItem title="Settings" />
			<MenuItem title="Messages" />
			<MenuItem title="Gallery" />
		</Menu>
	);
}
