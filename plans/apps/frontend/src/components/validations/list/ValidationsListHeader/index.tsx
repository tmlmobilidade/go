/* * */

import { openCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListHeader() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Validações GTFS</Label>
			<Spacer />
			<SearchInput onChange={validationsListContext.actions.setFilterSearch} value={validationsListContext.filters.search} />
			<HasPermission action={Permissions.validations.actions.create} scope={Permissions.validations.scope}>
				<Button label="Nova validação" leftSection={<IconPlus />} onClick={openCreateValidationModal} />
			</HasPermission>
		</>
	);

	//
}
