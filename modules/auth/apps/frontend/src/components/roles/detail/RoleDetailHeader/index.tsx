'use client';

/* * */

import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, keepUrlParams, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RoleDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const roleDetailContext = useRoleDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ROLES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={roleDetailContext.data.id || 'Novo Grupo de Permissões'} variant="secondary" />
			<Label size="lg" singleLine>{roleDetailContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Salvar"
				loading={roleDetailContext.flags.isSaving}
				onClick={roleDetailContext.actions.updateRole}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label="Apagar"
				onClick={roleDetailContext.actions.deleteRole}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
