/* * */

import { openCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListHeader() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Validações GTFS</Label>
			<Spacer />
			<SearchInput onChange={validationsListContext.actions.setFilterSearch} value={validationsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.gtfs_validations.actions.create} scope={PermissionCatalog.all.gtfs_validations.scope}>
				<Button label="Nova validação" leftSection={<IconPlus />} onClick={openCreateValidationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
