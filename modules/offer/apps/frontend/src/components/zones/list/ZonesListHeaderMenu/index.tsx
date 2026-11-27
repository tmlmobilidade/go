'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { ToolbarActions, type ToolbarActionsItemType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useZonesExtractAgenciesData } from '../../extract/use-zones-extract-agencies-data';
import { openZonesExtractModal } from '../../extract/ZonesExtract.modal';
import { useZonesListData } from '../use-zones-list-data';

/* * */

export function ZonesListHeaderMenu() {
	const { t } = useTranslation();
	const { error: agenciesError, hasReadPermission, ids, isLoading: agenciesLoading } = useZonesExtractAgenciesData();
	const { data, error, isLoading, isValidating } = useZonesListData();

	const menuActions = useMemo(() => {
		const actions: ToolbarActionsItemType[] = [];

		if (hasReadPermission) {
			actions.push({
				disabled: isLoading || isValidating || agenciesLoading || !!error || !!agenciesError || !data.length || !ids.length,
				icon: <IconFileDownload />,
				label: t('default:zones.list.actions.extract.label'),
				onClick: openZonesExtractModal,
			});
		}

		return actions;
	}, [agenciesError, agenciesLoading, data.length, error, hasReadPermission, ids.length, isLoading, isValidating, t]);

	if (!menuActions.length) return null;

	return <ToolbarActions groups={[{ actions: menuActions }]} />;
}
