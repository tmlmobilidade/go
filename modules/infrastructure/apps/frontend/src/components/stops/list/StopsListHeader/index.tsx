/* * */

import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { StopsListFilterSearch } from '../filters/StopsListFilterSearch';
import { StopsListHeaderMenu } from '../StopsListHeaderMenu';
import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useStopsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>Paragens</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer shrink />
			<StopsListFilterSearch />
			<StopsListHeaderMenu />
			{/* <HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
				<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openStopCreateModal} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.stops.actions.export} scope={PermissionCatalog.all.stops.scope}>
				<IconButton icon={<IconFileDownload />} onClick={openStopListExportModal} tooltip="Exportar paragens" variant="secondary" />
			</HasPermission> */}
		</Toolbar>
	);
}
