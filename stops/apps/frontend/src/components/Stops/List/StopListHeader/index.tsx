/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

import { openCreateStopMapModal } from '../../Detail/CreateStopModal/CreateStopMap';
import { openCreateStopInfosModal } from '../../Detail/CreateStopModal/CreateStopName';

/* * */

export function StopListHeader() {
	//

	//
	// A. Setup variables

	const stoplistcontext = useStopListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Paragens</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				miw={400}
				onChange={e => stoplistcontext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar alerta"
			/>
			<HasPermission action={Permissions.stops.actions.create} scope={Permissions.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openCreateStopMapModal} />
			</HasPermission>
		</>
	);

	//
}
