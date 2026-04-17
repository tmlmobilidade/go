/* * */

import { openCreateVehicleModal } from '@/components/Vehicles/create/VehicleCreate.modal';
import { useVehiclesListContext } from '@/contexts/VehiclesList.context';
import { IconPlus, IconUpload } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { openImportVehicleModal } from '../../import/VehicleImport.modal';

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
			<Label size="lg" caps singleLine>veículos</Label>
			<Spacer />
			<SearchInput onChange={vehiclesListContext.filters.search.set} value={vehiclesListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.vehicles.actions.create} scope={PermissionCatalog.all.vehicles.scope}>
				<Button label="Novo veículo" leftSection={<IconPlus />} onClick={openCreateVehicleModal} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.vehicles.actions.create} scope={PermissionCatalog.all.vehicles.scope}>
				<Button label="Importar veículo" leftSection={<IconUpload />} onClick={openImportVehicleModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
