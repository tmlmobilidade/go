/* * */

import { openCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, IconButton, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { openZoneListExportModal } from '../ZoneListExportModal/ZoneListExport.modal';

/* * */

export function ZonesListHeader() {
	//

	//
	// A. Setup variables

	const zonesListContext = useZonesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Zonas</Label>
			<Spacer />
			<SearchInput onChange={zonesListContext.filters.search.set} value={zonesListContext.filters.search.value} />
			<Button disabled={!zonesListContext.flags.canCreate} label="Nova Zona" leftSection={<IconPlus />} onClick={openCreateZoneModal} />
			<HasPermission action={PermissionCatalog.all.zones.actions.export} scope={PermissionCatalog.all.zones.scope}>
				<IconButton icon={<IconFileDownload />} onClick={openZoneListExportModal} tooltip="Exportar Zonas" variant="secondary" />
			</HasPermission>
		</Toolbar>
	);

	//
}
