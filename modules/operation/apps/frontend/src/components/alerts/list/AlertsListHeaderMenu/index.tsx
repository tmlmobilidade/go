'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, type ToolbarActionsItemType, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { openAlertsExtractModal } from '../../extract/AlertsExtract.modal';
import { useAlertsListData } from '../use-alerts-list-data';

/* * */

export function AlertsListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: meData } = useMeData();
	const { data, error, isLoading, isValidating } = useAlertsListData();

	//
	// B. Transform data

	const menuActions = useMemo(() => {
		const actions: ToolbarActionsItemType[] = [];

		if (hasPermission(meData?.permissions, { action: PermissionCatalog.all.alerts.actions.read, scope: PermissionCatalog.all.alerts.scope })) {
			actions.push({
				disabled: isLoading || isValidating || !!error || !data?.length,
				icon: <IconFileDownload />,
				label: t('alerts:list.AlertsListHeader.actions.extract.label'),
				onClick: openAlertsExtractModal,
			});
		}

		return actions;
	}, [data?.length, error, isLoading, isValidating, meData?.permissions, t]);

	//
	// C. Render components

	if (!menuActions.length) return null;

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
