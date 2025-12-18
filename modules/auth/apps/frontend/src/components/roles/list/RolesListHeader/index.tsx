'use client';

/* * */

import { openCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { useRolesListContext } from '@/contexts/RolesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RolesListHeader() {
	//

	//
	// A. Setup variables

	const roleListContext = useRolesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Grupos de Permissões</Label>
			<Spacer />
			<SearchInput onChange={roleListContext.actions.setFilterSearch} value={roleListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Novo Grupo" onClick={openCreateRoleModal} />
		</Toolbar>
	);

	//
}
