/* * */

import { openCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
		</Toolbar>
	);

	//
}
