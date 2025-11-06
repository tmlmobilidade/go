'use client';

/* * */

import { RoleDetailMode, useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Badge, Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
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
		const destUrl = keepUrlParams('/roles', window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Badge variant="muted">{roleDetailContext.data.id || 'Novo Utilizador'}</Badge>
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
