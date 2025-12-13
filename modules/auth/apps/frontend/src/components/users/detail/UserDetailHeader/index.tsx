'use client';

/* * */

import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { CloseButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UserDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const userDetailContext = useUserDetailContext();

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
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={userDetailContext.data.id || 'Novo Utilizador'} variant="muted" />
			<Label size="lg" singleLine>{userDetailContext.data.form.values.email}</Label>
			<Spacer />
			<Button
				disabled={!userDetailContext.data.form.isDirty() || !userDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={userDetailContext.flags.isSaving}
				onClick={userDetailContext.actions.saveUser}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label="Eliminar"
				onClick={userDetailContext.actions.deleteUser}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
