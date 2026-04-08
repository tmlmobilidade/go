/* * */

import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
		</Toolbar>
	);

	//
}
