/* * */

import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@go/ui';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const organizationsListContext = useOrganizationsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Organizações</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.actions.setFilterSearch} value={organizationsListContext.filters.search} />
			<Button href={Routes.ORGANIZATION_DETAIL('new')} icon={<IconPlus size={20} />} label="Nova organização" />
		</Toolbar>
	);

	//
}
