'use client';

import { IconFileTypePdf } from '@tabler/icons-react';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { ToolbarActions, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { openPlanPostersExtractModal } from '../../extract/posters/PlanPostersExtract.modal';

/* * */

export function PlansListHeaderMenu() {
	//

	const { data: meData } = useMeData();
	const { t } = useTranslation();

	const menuActions = useMemo(() => {
		const actions = [];
		if (hasPermission(meData.permissions, { action: 'generate_pdf_posters', scope: 'plans' })) {
			actions.push({
				icon: <IconFileTypePdf />,
				label: t('default:plans.list.PlansListHeaderMenu.extractPDFs'),
				onClick: openPlanPostersExtractModal,
			});
		}
		return actions;
	}, [meData.permissions, t]);

	return (
		<ToolbarActions groups={[{ actions: menuActions }]} />
	);
}
