'use client';

/* * */

import { useRolesListContext } from '@/contexts/RolesList.context';
import { IconPlus } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
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
			<Button href={PAGE_ROUTES.auth.ROLES_DETAIL('new')} icon={<IconPlus size={20} />} label="Novo Grupo" />
		</Toolbar>
	);

	//
}
