/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

import { openCreateStopMapModal } from '../../create/CreateStopMap';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Paragens</Label>
			<Spacer />
			<SearchInput onChange={stopsListContext.actions.setFilterSearch} value={stopsListContext.filters.search} />
			<HasPermission action={Permissions.stops.actions.create} scope={Permissions.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openCreateStopMapModal} />
			</HasPermission>
		</>
	);

	//
}
