'use client';

/* * */

import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { IconPlus } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

interface UserCreateHeaderProps {
	onClose?: () => void
}

/* * */

export function UserCreateHeader({ onClose }: UserCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
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
