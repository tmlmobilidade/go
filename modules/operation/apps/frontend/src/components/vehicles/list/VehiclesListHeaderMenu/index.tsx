'use client';

import { openVehiclesCreateModal } from '@/components/vehicles/create/VehiclesCreate.modal';
import { openVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { openVehiclesListExportModal } from '@/components/vehicles/list/VehiclesListExport/VehiclesListExport.modal';
import { IconFileDownload, IconPlus, IconUpload } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: meData } = useMeData();

	//
	// B. Transform data

	const menuActions = useMemo(() => {
		const actions = [];

		if (hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.vehicles.actions.create,
			scope: PermissionCatalog.all.vehicles.scope,
		})) {
			actions.push({
				icon: <IconPlus />,
				label: t('default:vehicles.list.VehiclesListHeaderMenu.create'),
				onClick: openVehiclesCreateModal,
			});
			actions.push({
				icon: <IconUpload />,
				label: t('default:vehicles.list.VehiclesListHeaderMenu.import'),
				onClick: openVehiclesImportModal,
			});
		}

		actions.push({
			icon: <IconFileDownload />,
			label: t('default:vehicles.list.VehiclesListHeaderMenu.export'),
			onClick: openVehiclesListExportModal,
		});

		return actions;
	}, [meData?.permissions, t]);

	//
	// C. Render components

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
