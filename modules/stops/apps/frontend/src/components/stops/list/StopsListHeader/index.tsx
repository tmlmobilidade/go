/* * */

import { CreateStopModal } from '@/components/stops/create/CreateStopModal';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	const [createStopModalState, setCreateStopModalState] = useState<boolean>(false);

	//
	// B. Render components

	return (
		<>
			<CreateStopModal
				onClose={() => setCreateStopModalState(false)}
				opened={createStopModalState}
			/>
			<Toolbar>
				<Label size="lg" caps>Paragens</Label>
				<Spacer />
				<SearchInput onChange={stopsListContext.actions.setFilterSearch} value={stopsListContext.filters.search} />
				<HasPermission action={Permissions.stops.actions.create} scope={Permissions.stops.scope}>
					<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={() => setCreateStopModalState(true)} />
				</HasPermission>
			</Toolbar>
		</>
	);

	//
}
