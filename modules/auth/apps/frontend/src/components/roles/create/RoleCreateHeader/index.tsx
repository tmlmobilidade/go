'use client';

/* * */

import { useRoleCreateContext } from '@/components/roles/create/RoleCreate.context';
import { closeCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { CloseButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RoleCreateHeader() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRoleModal} type="close" />
			<Tag label="Novo Grupo de Permissões" variant="secondary" />
			<Label size="lg" singleLine>{roleCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleCreateContext.data.form.values.name}
				icon={<IconUpload size={28} />}
				label="Criar"
				loading={roleCreateContext.flags.isSaving}
				onClick={roleCreateContext.actions.saveRole}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
