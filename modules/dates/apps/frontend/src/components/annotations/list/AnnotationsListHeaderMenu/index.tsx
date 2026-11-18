'use client';

import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { openCreateAnnotationModal } from '../../create/AnnotationCreate.modal';
import { openAnnotationsListExportModal } from '../export/AnnotationsListExport/AnnotationsListExport.modal';

/* * */

type ToolbarActionItem = ComponentProps<typeof ToolbarActions>['groups'][number]['actions'][number];

/* * */

export function AnnotationsListHeaderMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: me } = useMeData();

	//
	// B. Transform data

	const actions = useMemo(() => {
		const actions: ToolbarActionItem[] = [];
		if (hasPermission(me?.permissions, { action: PermissionCatalog.all.annotations.actions.create, scope: PermissionCatalog.all.annotations.scope })) {
			actions.push({ icon: <IconPlus />, label: t('default:annotations.create.title'), onClick: openCreateAnnotationModal });
		}
		actions.push({ icon: <IconFileDownload />, label: t('annotations:list.AnnotationsListHeaderMenu.export'), onClick: openAnnotationsListExportModal });
		return actions;
	}, [me?.permissions, t]);

	//
	// C. Render components

	return (
		<ToolbarActions groups={[{ actions }]} />
	);
}
