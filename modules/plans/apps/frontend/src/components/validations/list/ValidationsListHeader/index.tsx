/* * */

import { openCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { ValidationsListFilterSearch } from '@/components/validations/list/ValidationsListFilterSearch';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useValidationsListData } from '../use-validations-list-data';

/* * */

export function ValidationsListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useValidationsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Validações GTFS</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<ValidationsListFilterSearch />
			<HasPermission action={PermissionCatalog.all.gtfs_validations.actions.create} scope={PermissionCatalog.all.gtfs_validations.scope}>
				<Button label="Nova validação" leftSection={<IconPlus />} onClick={openCreateValidationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
