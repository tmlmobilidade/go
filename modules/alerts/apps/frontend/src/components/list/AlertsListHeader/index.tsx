/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { Label, Loader, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
			<Loader size="sm" visible={alertsListContext.flags.isValidating} />
			<Spacer />
			<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
		</Toolbar>
	);

	//
}
