'use client';

/* * */

import { useRoleListContext } from '@/contexts/RoleList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RoleListHeader() {
	//

	//
	// A. Setup variables

	const roleListContext = useRoleListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Roles</Label>
			<TextInput
				leftSection={<IconSearch size={20} />}
				miw={400}
				onChange={e => roleListContext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar role"
				value={roleListContext.filters.searchQuery}
			/>
			<Button href={Routes.ROLE_DETAIL('new')} icon={<IconPlus size={20} />} label="Novo role" />
		</>
	);

	//
}
