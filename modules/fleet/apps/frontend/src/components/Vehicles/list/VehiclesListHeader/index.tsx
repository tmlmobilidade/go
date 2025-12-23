/* * */

import { openCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { useVehiclesListContext } from '@/components/Vehicles/list/VehiclesList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListHeader() {
	//

	//
	// A. Setup variables

	const vehiclesListContext = useVehiclesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Anotações</Label>
			<Spacer />
			<SearchInput onChange={vehiclesListContext.actions.setFilterSearch} value={vehiclesListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.fleet.actions.create} scope={PermissionCatalog.all.fleet.scope}>
				<Button label="Nova anotação" leftSection={<IconPlus />} onClick={openCreateVehicleModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
