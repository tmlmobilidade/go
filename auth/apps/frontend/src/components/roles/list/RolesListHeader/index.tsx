'use client';

/* * */

import { useRolesListContext } from '@/contexts/RolesList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RolesListHeader() {
	//

	//
	// A. Setup variables

	const roleListContext = useRolesListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Roles</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => roleListContext.actions.setFilterSearch(e.target.value)}
				placeholder="Pesquisar role"
				value={roleListContext.filters.search}
			/>
			<Button
				href={Routes.ROLE_DETAIL('new')}
				icon={<IconPlus size={20} />}
				label="Novo role"
			/>
		</>
	);

	//
}
