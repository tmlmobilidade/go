/* * */

import { IconFileDownload, IconGardenCart, IconPlus } from '@tabler/icons-react';
import { ToolbarActions } from '@tmlmobilidade/ui';

import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsListHeaderMenu() {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	// <HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
	// 			<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} onClick={openStopCreateModal} />
	// 		</HasPermission>
	// 		<HasPermission action={PermissionCatalog.all.stops.actions.export} scope={PermissionCatalog.all.stops.scope}>
	// 			<IconButton icon={<IconFileDownload />} onClick={openStopListExportModal} tooltip="Exportar paragens" variant="secondary" />
	// 		</HasPermission>
	// 	</Toolbar>

	return (
		<ToolbarActions groups={[{
			actions: [
				{ icon: <IconGardenCart size={20} />, label: 'Paragens', onClick: () => {} },
				{ icon: <IconPlus size={20} />, label: 'Nova Paragem', onClick: () => {} },
				{ icon: <IconFileDownload size={20} />, label: 'Exportar Paragens', onClick: () => {} },
			],
			label: 'Paragens',
		}]}
		/>
	);
}
