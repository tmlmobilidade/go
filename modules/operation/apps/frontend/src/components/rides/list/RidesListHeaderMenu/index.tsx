'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { openRidesExtractModal } from '../../extract/RidesExtract.modal';

/* * */

export function RidesListHeaderMenu() {
	//

	const { data: meData } = useMeData();

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(meData.permissions, { action: PermissionCatalog.all.rides.actions.analysis_read, scope: PermissionCatalog.all.rides.scope })) {
			actions.push({
				icon: <IconFileDownload />,
				label: 'Exportar Circulações',
				onClick: openRidesExtractModal,
			});
		}
		return actions;
	}, [meData.permissions]);

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
