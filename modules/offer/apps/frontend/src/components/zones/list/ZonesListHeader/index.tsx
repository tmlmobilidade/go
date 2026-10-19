/* * */

import { openCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function ZonesListHeader() {
	//

	//
	// A. Setup variables

	const zonesListContext = useZonesListContext();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<Button disabled={!zonesListContext.flags.canCreate} label="Nova Zona" leftSection={<IconPlus />} onClick={openCreateZoneModal} />}
			count={zonesListContext.data.filtered.length}
			search={<SearchField onChange={zonesListContext.filters.search.set} value={zonesListContext.filters.search.value} />}
			title="Zonas"
		/>
	);

	//
}
