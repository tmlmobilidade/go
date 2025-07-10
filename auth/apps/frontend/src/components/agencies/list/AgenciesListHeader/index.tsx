/* * */

import { useAgenciesListContext } from '@/contexts/AgenciesList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

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
			<Label size="lg" caps>Agências</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => agenciesListContext.actions.setFilterSearch(e.target.value)}
				placeholder="Pesquisar..."
				value={agenciesListContext.filters.search}
			/>
			<Button
				href={Routes.AGENCY_DETAIL('new')}
				icon={<IconPlus size={20} />}
				label="Nova agência"
			/>
		</>
	);

	//
}
