'use client';

import { openPlansSteppExtractModal } from '@/components/plans/stepp/PlansSteppExtract.modal';
import { IconFileDownload } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: meData } = useMeData();

	//
	// B. Transform data

	const menuActions = useMemo(() => {
		if (!hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.plans.actions.read,
			scope: PermissionCatalog.all.plans.scope,
		})) return [];
		return [{
			icon: <IconFileDownload />,
			label: t('default:plans.list.PlansListHeaderMenu.extractStepp'),
			onClick: openPlansSteppExtractModal,
		}];
	}, [meData?.permissions, t]);

	//
	// C. Render components

	return <ToolbarActions groups={[{ actions: menuActions }]} />;
}
