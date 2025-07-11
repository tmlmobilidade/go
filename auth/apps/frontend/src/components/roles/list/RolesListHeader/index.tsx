'use client';

/* * */

import { useRolesListContext } from '@/contexts/RolesList.context';
import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

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
			<Label size="lg" caps singleLine>Grupos de Permissões</Label>
			<Spacer />
			<SearchInput onChange={roleListContext.actions.setFilterSearch} value={roleListContext.filters.search} />
			<Button href={Routes.ROLE_DETAIL('new')} icon={<IconPlus size={20} />} label="Novo role" />
		</>
	);

	//
}
