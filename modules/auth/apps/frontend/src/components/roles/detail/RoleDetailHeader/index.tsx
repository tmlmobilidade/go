'use client';

/* * */

import { RoleDetailMode, useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { BackButton, Button, keepUrlParams, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
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
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.ROLES_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={roleDetailContext.data.id || 'Novo Grupo de Permissões'} variant="secondary" />
			<Label size="lg" singleLine>{roleDetailContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={roleDetailContext.flags.mode === RoleDetailMode.CREATE ? 'Publicar' : 'Salvar'}
				loading={roleDetailContext.flags.isSaving}
				onClick={roleDetailContext.actions.saveRole}
				variant="primary"
			/>
			{roleDetailContext.flags.mode === RoleDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={roleDetailContext.actions.deleteRole}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
