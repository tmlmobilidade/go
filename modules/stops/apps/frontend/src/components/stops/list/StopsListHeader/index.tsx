/* * */

import { openCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Paragens</Label>
			<Spacer />
			<SearchInput onChange={stopsListContext.filters.search.set} value={stopsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openCreateStopModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
