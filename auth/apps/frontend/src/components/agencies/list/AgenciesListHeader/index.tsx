/* * */

import { useAgenciesListContext } from '@/contexts/AgenciesList.context';
import { Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

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
		</>
	);

	//
}
