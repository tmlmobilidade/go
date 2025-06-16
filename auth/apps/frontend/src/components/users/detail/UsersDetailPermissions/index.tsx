'use client';

/* * */

import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, Collapsible, Grid, Section, useTree } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

export function UsersDetailPermissions() {
	//

	//
	// A. Setup variables

	const tree = useTree();
	const usersDetailContext = useUsersDetailContext();

	//
	// B. Transform data

	useEffect(() => {
		const permissions = usersDetailContext.data?.form.getValues().permissions ?? [];
		const initialCheckedState = permissions.map(permission => `${permission.scope}-${permission.action}`);
		tree.setCheckedState(initialCheckedState);
	}, [usersDetailContext.data?.form.getValues().permissions]);

	//
	// C. Render components

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar no sistema."
			title="Permissões"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="sm">
					<Button icon={<IconCheck />} label="Selecionar todos" onClick={() => usersDetailContext.actions.handlePermissionChange('*')} variant="secondary" />
					<Button icon={<IconX />} label="Desmarcar todos" onClick={() => usersDetailContext.actions.handlePermissionChange('!*')} variant="danger" />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
