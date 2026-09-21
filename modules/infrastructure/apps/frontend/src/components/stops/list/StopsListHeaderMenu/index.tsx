'use client';

import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { openStopsCreateModal } from '../../create/StopsCreate.modal';
import { openStopsExtractModal } from '../../extract/StopsExtract.modal';

/* * */

type ToolbarActionItem = ComponentProps<typeof ToolbarActions>['groups'][number]['actions'][number];

/* * */

export function StopsListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: meData } = useMeData();

	//
	// B. Transform data

	const menuActions = useMemo(() => {
		const actions: ToolbarActionItem[] = [];
		if (hasPermission(meData?.permissions, { action: PermissionCatalog.all.stops.actions.create, scope: PermissionCatalog.all.stops.scope })) {
			actions.push({
				icon: <IconPlus />,
				label: t('default:stops.list.HeaderMenu.NewStopButton.label'),
				onClick: openStopsCreateModal,
			});
		}
		if (hasPermission(meData?.permissions, { action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope })) {
			actions.push({
				icon: <IconFileDownload />,
				label: t('default:stops.list.HeaderMenu.ExtractStopsButton.label'),
				onClick: openStopsExtractModal,
			});
		}
		return actions;
	}, [meData?.permissions, t]);

	//
	// C. Render components

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
