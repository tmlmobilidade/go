/* * */

import { useAgenciesListContext } from '@/contexts/AgenciesList.context';
import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

/* * */

export function AgenciesListHeader() {
	//

	//
	// A. Setup variables

	const agenciesListContext = useAgenciesListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Operadores</Label>
			<Spacer />
			<SearchInput onChange={agenciesListContext.actions.setFilterSearch} value={agenciesListContext.filters.search} />
			<Button href={Routes.AGENCY_DETAIL('new')} icon={<IconPlus size={20} />} label="Nova agência" />
		</>
	);

	//
}
