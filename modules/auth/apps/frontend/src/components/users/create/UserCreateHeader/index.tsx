'use client';

/* * */

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { closeCreateUserModal } from '@/components/users/create/UserCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function UserCreateHeader() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateUserModal} type="close" />
			<Tag label="Novo Utilizador" variant="secondary" />
			<Spacer />
			<Button
				disabled={!userCreateContext.data.form.isValid()}
				icon={<IconPlus size={28} />}
				label="Criar"
				loading={userCreateContext.flags.isSaving}
				onClick={userCreateContext.actions.saveUser}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
