'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { openRidesExtractModal } from '../../extract/RidesExtract.modal';

/* * */

export function RidesListHeaderMenu() {
	//

	const { data: meData } = useMeData();

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(meData.permissions, { action: 'export', scope: 'rides' })) {
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
