'use client';

/* * */

import { UsersDetailMode, useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailHeader() {
	//

	//
	// A. Setup variables

	const usersDetailContext = useUsersDetailContext();

	//
	// B. Render components

	return (
		<>
			<BackButton type="close" />
			<Tag label={usersDetailContext.data.id || 'Novo Utilizador'} variant="muted" />
			<Spacer />
			<Button
				disabled={!usersDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={usersDetailContext.flags.mode === UsersDetailMode.CREATE ? 'Publicar' : 'Guardar'}
				loading={usersDetailContext.flags.isSaving}
				onClick={usersDetailContext.actions.saveUser}
				variant="primary"
			/>
			{usersDetailContext.flags.mode === UsersDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={usersDetailContext.actions.deleteUser}
					variant="danger"
				/>
			)}
		</>
	);

	//
}
