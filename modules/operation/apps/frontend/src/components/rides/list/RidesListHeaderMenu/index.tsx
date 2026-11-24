'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMePermissions } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { openRidesExtractModal } from '../../extract/RidesExtract.modal';

/* * */

export function RidesListHeaderMenu() {
	//

	const { data: mePermissions } = useMePermissions();

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(mePermissions, { action: 'analysis_read', scope: 'rides' })) {
			actions.push({
				icon: <IconFileDownload />,
				label: 'Exportar Circulações',
				onClick: openRidesExtractModal,
			});
		}
		return actions;
	}, [mePermissions]);

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
