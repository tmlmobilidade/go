'use client';

/* * */

import { UsersDetailMode, useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UsersDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const usersDetailContext = useUserDetailContext();

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
			<Label size="lg" singleLine>{usersDetailContext.data.form.values.email}</Label>
			<Spacer />
			<Button
				disabled={!usersDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={usersDetailContext.flags.mode === UsersDetailMode.CREATE ? 'Publicar' : 'Guardar'}
				loading={usersDetailContext.flags.isSaving}
				onClick={usersDetailContext.actions.saveUser}
				variant="primary"
			/>
			{usersDetailContext.flags.mode === UsersDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Eliminar"
					onClick={usersDetailContext.actions.deleteUser}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
