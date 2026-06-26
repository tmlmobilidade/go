/* * */
import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { IconFileDownload } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { HasPermission, IconButton, Label, Loader, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { openAlertListExportModal } from '../AlertListExportModal';

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
			<HasPermission action={PermissionCatalog.all.alerts.actions.export} scope={PermissionCatalog.all.alerts.scope}>
				<IconButton icon={<IconFileDownload />} onClick={openAlertListExportModal} tooltip="Exportar alertas" variant="secondary" />
			</HasPermission>
		</Toolbar>
	);

	//
}
