/* * */

import { openCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

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
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => validationsListContext.actions.setFilterSearch(e.target.value)}
				placeholder="Pesquisar..."
				value={validationsListContext.filters.search}
			/>
			<HasPermission
				action={Permissions.validations.actions.create}
				scope={Permissions.validations.scope}
			>
				<Button label="Nova validação" leftSection={<IconPlus size={20} />} onClick={openCreateValidationModal} />
			</HasPermission>
		</>
	);

	//
}
