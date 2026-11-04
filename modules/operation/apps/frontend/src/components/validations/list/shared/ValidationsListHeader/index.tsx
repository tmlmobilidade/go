'use client';

import { openCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { ValidationsListFilterSearch } from '@/components/validations/list/filters/ValidationsListFilterSearch';
import { useValidationsListData } from '@/components/validations/list/use-validations-list-data';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useValidationsListData();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<ValidationsListFilterSearch />}
			title="Validações GTFS"
			actions={(
				<HasPermission action={PermissionCatalog.all.gtfs_validations.actions.create} scope={PermissionCatalog.all.gtfs_validations.scope}>
					<Button label="Nova validação" leftSection={<IconPlus />} onClick={openCreateValidationModal} />
				</HasPermission>
			)}
		/>
	);

	//
}
