/* * */

import { useAgenciesListContext } from '@/contexts/AgenciesList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@go/ui';

/* * */

export function AgenciesListHeader() {
	//

	//
	// A. Setup variables

	const agenciesListContext = useAgenciesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Operadores</Label>
			<Spacer />
			<SearchInput onChange={agenciesListContext.actions.setFilterSearch} value={agenciesListContext.filters.search} />
		</Toolbar>
	);

	//
}
