/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

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
			<TextInput
				leftSection={<IconSearch size={20} />}
				miw={400}
				onChange={e => stopsListContext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar alerta"
			/>
			<HasPermission action={Permissions.stops.actions.create} scope={Permissions.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openCreateStopMapModal} />
			</HasPermission>
		</>
	);

	//
}
