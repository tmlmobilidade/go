'use client';

/* * */

import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

interface RoleCreateHeaderProps {
	onClose?: () => void
}

export function RoleCreateHeader({ onClose }: RoleCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label="Novo Grupo de Permissões" variant="secondary" />
			<Label size="lg" singleLine>{roleCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!roleCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Criar"
				loading={roleCreateContext.flags.isSaving}
				onClick={roleCreateContext.actions.saveRole}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
