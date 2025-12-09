'use client';
/* * */

import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const organizationsListContext = useOrganizationsListContext();
	const organizationCreateContext = useOrganizationCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Organizações</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.actions.setFilterSearch} value={organizationsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Nova organização" onClick={organizationCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
