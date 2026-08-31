'use client';

import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopsListHeaderMenu() {
	//

	const { data: meData } = useMeData();

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(meData.permissions, { action: 'create', scope: 'stops' })) {
			actions.push({
				icon: <IconPlus />,
				label: 'Nova Paragem',
				onClick: () => {},
			});
		}
		if (hasPermission(meData.permissions, { action: 'export', scope: 'stops' })) {
			actions.push({
				icon: <IconFileDownload />,
				label: 'Exportar Paragens',
				onClick: () => {},
			});
		}
		return actions;
	}, [meData.permissions]);

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
