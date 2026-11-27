'use client';

import { IconMapDown, IconPlus } from '@tabler/icons-react';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMePermissions } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { openCreateZoneModal } from '../../create/ZoneCreate.modal';
import { openZonesExportGeopackageModal } from '../../export/geopackages/ZonesListExport.modal';

/* * */

export function ZonesListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { data: mePermissions } = useMePermissions();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(mePermissions, { action: 'create', scope: 'zones' })) {
			actions.push({
				icon: <IconPlus />,
				label: t('default:zones.create.title'),
				onClick: openCreateZoneModal,
			});
		}
		if (hasPermission(mePermissions, { action: 'export-geopackage', scope: 'zones' })) {
			actions.push({
				icon: <IconMapDown />,
				label: t('zones:list.ZonesListHeaderMenu.export_geopackage'),
				onClick: openZonesExportGeopackageModal,
			});
		}
		return actions;
	}, [mePermissions, t]);

	//
	// C. Render components

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
