'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { RoleDetailMode, useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Badge, Button, Spacer } from '@tmlmobilidade/ui';

/* * */

export function RoleDetailHeader() {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();

	//
	// B. Render components

	return (
		<>
			<BackButton />
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
		</>
	);

	//
}
