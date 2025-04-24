/* * */

import { OpenCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListHeader() {
	//
	// A. Render components

	return (
		<>
			<Label size="lg" caps>Validationos</Label>
			<Spacer />
			<Button label="Novo validationo" leftSection={<IconPlus size={20} />} onClick={OpenCreateValidationModal} />
		</>
	);

	//
}
