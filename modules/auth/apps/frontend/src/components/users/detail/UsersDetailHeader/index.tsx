'use client';

/* * */

import { UsersDetailMode, useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UsersDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const usersDetailContext = useUsersDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.USERS_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
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
		</Toolbar>
	);

	//
}
