/* * */

import { OpenCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListHeader() {
	//
	// A. Render components

	return (
		<>
			<Label size="lg" caps>Validações</Label>
			<Spacer />
			<HasPermission
				action={Permissions.validations.actions.create}
				scope={Permissions.validations.scope}
			>
				<Button label="Nova validação" leftSection={<IconPlus size={20} />} onClick={OpenCreateValidationModal} />
			</HasPermission>
		</>
	);

	//
}
